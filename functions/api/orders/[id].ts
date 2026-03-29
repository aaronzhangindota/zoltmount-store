import { requireAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'
import { getCarrierCode } from '../tracking/_carrier-map'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
  RESEND_API_KEY: string
  TRACK17_API_KEY: string
}

// ─── 邮件模板 ───

function getEmailSubject(orderId: string, status: string): string {
  switch (status) {
    case 'processing': return `Order #${orderId} Confirmed`
    case 'shipped':    return `Order #${orderId} Has Shipped!`
    case 'completed':  return `Order #${orderId} is Complete`
    case 'cancelled':  return `Order #${orderId} Cancelled`
    default:           return `Order #${orderId} Status Update`
  }
}

function getStatusBlock(order: any, status: string): string {
  switch (status) {
    case 'processing':
      return `<p>Thank you for your order! We've received your payment and are now preparing your items for shipment.</p>
              <p>We'll notify you as soon as your order ships.</p>`
    case 'shipped': {
      let tracking = ''
      if (order.trackingNumber) {
        tracking += `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
        tracking += `<p><a href="https://zoltmount.com/track?number=${encodeURIComponent(order.trackingNumber)}" style="color:#2563eb;text-decoration:underline;">Track your package on our website</a></p>`
      }
      if (order.carrier) {
        tracking += `<p><strong>Carrier:</strong> ${order.carrier}</p>`
      }
      return `<p>Great news! Your order has been shipped and is on its way to you.</p>${tracking}`
    }
    case 'completed':
      return `<p>Your order has been delivered and marked as complete. We hope you're enjoying your new TV mount!</p>
              <p>We'd love to see you again — visit <a href="https://zoltmount.com" style="color:#2563eb;">zoltmount.com</a> anytime.</p>`
    case 'cancelled':
      return `<p>Your order has been cancelled. If you did not request this cancellation or have any questions, please don't hesitate to contact us.</p>`
    default:
      return `<p>Your order status has been updated to: <strong>${status}</strong>.</p>`
  }
}

function getProductImageUrl(order: any): string {
  const firstItem = (order.items || [])[0]
  if (!firstItem) return ''
  // 从商品的 image 字段获取图片路径，兼容完整 URL 和相对路径
  const img = firstItem.image || firstItem.imageUrl || ''
  if (!img) return ''
  if (img.startsWith('http')) return img
  return `https://zoltmount.com${img.startsWith('/') ? '' : '/'}${img}`
}

function buildEmailHtml(order: any, status: string): string {
  const firstName = order.customer?.firstName || 'Customer'
  const items = (order.items || []).map((item: any) =>
    `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;">${item.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:14px;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;">$${Number(item.price).toFixed(2)}</td>
    </tr>`
  ).join('')

  const total = order.total != null ? `$${Number(order.total).toFixed(2)}` : '—'
  const productImg = getProductImageUrl(order)
  const productImageBlock = productImg
    ? `<div style="text-align:center;margin:20px 0 8px;">
        <img src="${productImg}" alt="Product" style="max-width:100%;max-height:280px;height:auto;border-radius:8px;border:1px solid #e5e7eb;" />
      </div>`
    : ''

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

        <!-- ===== HEADER: Logo + Slogan ===== -->
        <tr>
          <td style="background:#2c3d4d;padding:36px 24px 28px;text-align:center;">
            <img src="https://zoltmount.com/images/zoltmount-logo.jpg" alt="ZoltMount" width="260" style="display:block;margin:0 auto;max-width:260px;height:auto;" />
            <p style="margin:14px 0 0;font-size:11px;letter-spacing:2.5px;color:#c1ced8;text-transform:uppercase;font-weight:300;">30 Years of Engineering Excellence</p>
          </td>
        </tr>

        <!-- ===== Spacer ===== -->
        <tr><td style="height:8px;background:linear-gradient(to right,#3b82f6,#1e40af);font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- ===== BODY ===== -->
        <tr>
          <td style="padding:40px 32px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#1e293b;line-height:1.6;">Hi ${firstName},</p>
            <div style="font-size:15px;color:#374151;line-height:1.7;">
              ${getStatusBlock(order, status)}
            </div>

            <!-- Order Details -->
            <div style="margin:28px 0;padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
              <p style="margin:0 0 14px;font-weight:700;font-size:15px;color:#0f172a;">Order #${order.id}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="background:#e2e8f0;">
                  <th style="padding:10px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;">Item</th>
                  <th style="padding:10px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;">Qty</th>
                  <th style="padding:10px 14px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;">Price</th>
                </tr>
                ${items}
                <tr>
                  <td colspan="2" style="padding:12px 14px;font-weight:700;text-align:right;font-size:15px;color:#0f172a;">Total:</td>
                  <td style="padding:12px 14px;font-weight:700;text-align:right;font-size:15px;color:#0f172a;">${total}</td>
                </tr>
              </table>
              ${productImageBlock}
            </div>
          </td>
        </tr>

        <!-- ===== FOOTER ===== -->
        <tr>
          <td style="padding:28px 32px;background:#2c3d4d;text-align:center;">
            <p style="margin:0 0 12px;font-size:13px;color:#e2e8f0;">Questions? Contact us at <a href="mailto:support@zoltmount.com" style="color:#60a5fa;text-decoration:none;">support@zoltmount.com</a></p>
            <div style="margin:16px 0;border-top:1px solid #334155;padding-top:16px;">
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

// ─── Resend 邮件发送 ───

async function sendOrderStatusEmail(env: Env, order: any, newStatus: string): Promise<void> {
  if (!env.RESEND_API_KEY) return

  const email = order.customer?.email
  if (!email || email === 'guest@example.com') return

  // 只对这 4 种状态发邮件
  if (!['processing', 'shipped', 'completed', 'cancelled'].includes(newStatus)) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ZoltMount <noreply@zoltmount.com>',
        to: [email],
        subject: getEmailSubject(order.id, newStatus),
        html: buildEmailHtml(order, newStatus),
      }),
    })
  } catch {
    // 邮件发送失败不影响主流程
  }
}

// ─── 17TRACK 运单注册 ───

async function registerTo17Track(env: Env, trackingNumber: string, carrier?: string): Promise<void> {
  if (!env.TRACK17_API_KEY || !trackingNumber) return

  const carrierCode = carrier ? getCarrierCode(carrier) : undefined
  const body: any[] = [{ number: trackingNumber }]
  if (carrierCode) {
    body[0].carrier = carrierCode
  } else {
    body[0].auto_detection = true
  }

  try {
    await fetch('https://api.17track.net/track/v2.2/register', {
      method: 'POST',
      headers: {
        '17token': env.TRACK17_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // 保存注册元数据到 KV（90天TTL）
    await env.ZOLTMOUNT_KV.put(
      `tracking:${trackingNumber}`,
      JSON.stringify({ carrier: carrier || 'auto', carrierCode, registeredAt: new Date().toISOString() }),
      { expirationTtl: 90 * 24 * 3600 }
    )
  } catch {
    // 注册失败不影响主流程
  }
}

// ─── API Handlers ───

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const data = await request.json() as any
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const idx = orders.findIndex((o: any) => o.id === id)
  if (idx === -1) {
    const item = { ...data, id }
    orders.push(item)
    await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)
    return json(item, 201)
  }

  const oldStatus = orders[idx].status
  orders[idx] = { ...orders[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'orders', orders)

  if (data.status && data.status !== oldStatus) {
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新订单 ${id} 状态为「${data.status}」`, 'orders')
    context.waitUntil(sendOrderStatusEmail(env, orders[idx], data.status))
  }
  if (data.trackingNumber) {
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新订单 ${id} 物流单号`, 'orders')
    // 自动注册运单到 17TRACK（异步，不阻塞主流程）
    context.waitUntil(registerTo17Track(env, data.trackingNumber, data.carrier || orders[idx].carrier))
  }

  return json(orders[idx])
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const filtered = orders.filter((o: any) => o.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'orders', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除订单 ${id}`, 'orders')
  return json({ success: true })
}
