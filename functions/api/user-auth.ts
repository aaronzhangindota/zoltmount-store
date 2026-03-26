import { getCollection, putCollection, json, requireUser, sanitizeUser, authenticateAdmin } from './_middleware'
import type { UserRecord } from './_middleware'
import type { PromoCode } from './promo-codes'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
  RESEND_API_KEY: string
}

// POST: register / login (no auth required)
// GET: get current user (requires X-User-Token) OR admin list all users (requires X-Admin-Token + ?admin=1)
// PUT: update profile / change password / add points / use points (requires X-User-Token)

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as Record<string, any>
  const { action } = body
  const kv = context.env.ZOLTMOUNT_KV

  if (action === 'register') {
    const { email, password, firstName, lastName } = body
    if (!email || !password || !firstName || !lastName) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const users = await getCollection<UserRecord>(kv, 'users')
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return json({ error: 'emailExists' }, 409)
    }

    const token = crypto.randomUUID()
    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      email,
      password,
      firstName,
      lastName,
      phone: '',
      addresses: [],
      points: 0,
      totalSpent: 0,
      memberSince: new Date().toISOString(),
      token,
    }

    users.push(newUser)
    await putCollection(kv, 'users', users)

    // 生成注册专属一次性优惠码 + 发送欢迎邮件
    context.waitUntil(createWelcomePromoAndEmail(context.env, newUser))

    return json({ token, user: sanitizeUser(newUser) })
  }

  if (action === 'login') {
    const { email, password } = body
    if (!email || !password) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const users = await getCollection<UserRecord>(kv, 'users')
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      return json({ error: 'invalidCredentials' }, 401)
    }

    // Generate new token on each login
    user.token = crypto.randomUUID()
    await putCollection(kv, 'users', users)

    return json({ token: user.token, user: sanitizeUser(user) })
  }

  return json({ error: 'Invalid action' }, 400)
}

// ─── 注册欢迎邮件 + 一次性优惠码 ───

async function createWelcomePromoAndEmail(env: Env, user: UserRecord): Promise<void> {
  if (!env.RESEND_API_KEY) return

  try {
    // 生成唯一优惠码：WELCOME-XXXX
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    const promoCode = `WELCOME-${suffix}`

    // 写入 promo-codes 集合，usageLimit = 1（一次性）
    const codes = await getCollection<PromoCode>(env.ZOLTMOUNT_KV, 'promo-codes')
    codes.push({
      id: 'pc-welcome-' + Date.now() + '-' + suffix,
      code: promoCode,
      discountPercent: 10,
      active: true,
      usageLimit: 1,
      usedCount: 0,
      minOrderAmount: 0,
      createdAt: new Date().toISOString(),
    })
    await putCollection(env.ZOLTMOUNT_KV, 'promo-codes', codes)

    // 发送欢迎邮件
    const firstName = user.firstName || 'Customer'
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ZoltMount <noreply@zoltmount.com>',
        to: [user.email],
        subject: `Welcome to ZoltMount, ${firstName}! Here's Your 10% Off Code`,
        html: buildWelcomeEmailHtml(firstName, promoCode),
      }),
    })
  } catch {
    // 不影响注册主流程
  }
}

function buildWelcomeEmailHtml(firstName: string, promoCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#e5e7eb;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e5e7eb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- HEADER -->
        <tr>
          <td style="background:#2c3d4d;padding:36px 24px 28px;text-align:center;">
            <img src="https://zoltmount.com/images/zoltmount-logo.jpg" alt="ZoltMount" width="260" style="display:block;margin:0 auto;max-width:260px;height:auto;" />
            <p style="margin:14px 0 0;font-size:11px;letter-spacing:2.5px;color:#c1ced8;text-transform:uppercase;font-weight:300;">30 Years of Engineering Excellence</p>
          </td>
        </tr>

        <!-- Accent bar -->
        <tr><td style="height:8px;background:linear-gradient(to right,#3b82f6,#1e40af);font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 32px 32px;">
            <h2 style="margin:0 0 20px;font-size:22px;color:#0f172a;">Welcome to ZoltMount!</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${firstName},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Thank you for creating your account! We're thrilled to have you join the ZoltMount family. With 30 years of engineering excellence, we're committed to delivering the best TV mounting solutions.</p>

            <!-- Promo Code Box -->
            <div style="margin:28px 0;padding:28px 24px;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-radius:12px;border:2px dashed #3b82f6;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your Exclusive Welcome Offer</p>
              <p style="margin:0 0 4px;font-size:36px;font-weight:800;color:#1e40af;letter-spacing:1px;">10% OFF</p>
              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">Use this one-time code at checkout:</p>
              <div style="display:inline-block;background:#1e40af;color:#ffffff;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:700;letter-spacing:3px;">${promoCode}</div>
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Single use only. No minimum order required.</p>
            </div>

            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Browse our full collection and find the perfect mount for your setup:</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://zoltmount.com/products" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">Shop Now</a>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:28px 32px;background:#2c3d4d;text-align:center;">
            <p style="margin:0 0 12px;font-size:13px;color:#e2e8f0;">Questions? Contact us at <a href="mailto:support@zoltmount.com" style="color:#60a5fa;text-decoration:none;">support@zoltmount.com</a></p>
            <div style="margin:16px 0;border-top:1px solid #3d5060;padding-top:16px;">
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;letter-spacing:0.3px;">Operated by VELL EDUCATION GROUP LIMITED (HK)</p>
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;">Room C10, 4/F, Block C2, Hang Wai Industrial Centre, No. 6 Kin Tai Street, Tuen Mun, Hong Kong</p>
              <p style="margin:8px 0 0;font-size:10px;color:#64748b;">EU Registered Trademark | Legal Representation by AOMB (NL)</p>
            </div>
            <p style="margin:16px 0 0;font-size:11px;color:#64748b;">&copy; ${new Date().getFullYear()} ZoltMount. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)

  // Admin listing all users: GET /api/user-auth?admin=1
  if (url.searchParams.get('admin') === '1') {
    const adminAuth = await authenticateAdmin(context.request, context.env)
    if (!adminAuth) {
      return json({ error: 'Unauthorized' }, 401)
    }
    const users = await getCollection<UserRecord>(context.env.ZOLTMOUNT_KV, 'users')
    const safeUsers = users.map((u) => sanitizeUser(u))
    return json(safeUsers)
  }

  // Normal user: get own profile
  const result = await requireUser(context.request, context.env.ZOLTMOUNT_KV)
  if ('denied' in result) return result.denied

  return json({ user: sanitizeUser(result.user) })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const kv = context.env.ZOLTMOUNT_KV
  const result = await requireUser(context.request, kv)
  if ('denied' in result) return result.denied

  const { user, users } = result
  const body = await context.request.json() as Record<string, any>
  const { action } = body

  if (action === 'updateProfile') {
    const { firstName, lastName, phone } = body
    if (firstName !== undefined) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName
    if (phone !== undefined) user.phone = phone
    await putCollection(kv, 'users', users)
    return json({ user: sanitizeUser(user) })
  }

  if (action === 'changePassword') {
    const { oldPassword, newPassword } = body
    if (user.password !== oldPassword) {
      return json({ error: 'wrongPassword' }, 400)
    }
    user.password = newPassword
    await putCollection(kv, 'users', users)
    return json({ success: true })
  }

  if (action === 'addPoints') {
    const { points, spent } = body
    if (typeof points !== 'number' || points < 0) {
      return json({ error: 'Invalid points' }, 400)
    }
    user.points += points
    if (typeof spent === 'number' && spent > 0) {
      user.totalSpent += spent
    }
    await putCollection(kv, 'users', users)
    return json({ user: sanitizeUser(user) })
  }

  if (action === 'usePoints') {
    const { points } = body
    if (typeof points !== 'number' || points < 0) {
      return json({ error: 'Invalid points' }, 400)
    }
    if (user.points < points) {
      return json({ error: 'Insufficient points' }, 400)
    }
    user.points -= points
    await putCollection(kv, 'users', users)
    return json({ user: sanitizeUser(user) })
  }

  return json({ error: 'Invalid action' }, 400)
}
