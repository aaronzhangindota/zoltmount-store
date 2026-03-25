import { requireAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
  RESEND_API_KEY: string
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

function buildEmailHtml(order: any, status: string): string {
  const firstName = order.customer?.firstName || 'Customer'
  const items = (order.items || []).map((item: any) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${Number(item.price).toFixed(2)}</td>
    </tr>`
  ).join('')

  const total = order.total != null ? `$${Number(order.total).toFixed(2)}` : '—'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#1e293b;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;">ZoltMount</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 24px;">
            <p style="margin:0 0 16px;font-size:16px;">Hi ${firstName},</p>
            ${getStatusBlock(order, status)}
            <!-- Order Details -->
            <div style="margin:24px 0;padding:16px;background:#f9fafb;border-radius:6px;">
              <p style="margin:0 0 12px;font-weight:bold;font-size:15px;">Order #${order.id}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr style="background:#e5e7eb;">
                  <th style="padding:8px 12px;text-align:left;">Item</th>
                  <th style="padding:8px 12px;text-align:center;">Qty</th>
                  <th style="padding:8px 12px;text-align:right;">Price</th>
                </tr>
                ${items}
                <tr>
                  <td colspan="2" style="padding:10px 12px;font-weight:bold;text-align:right;">Total:</td>
                  <td style="padding:10px 12px;font-weight:bold;text-align:right;">${total}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;background:#f9fafb;text-align:center;font-size:13px;color:#6b7280;">
            <p style="margin:0 0 8px;">Questions? Contact us at <a href="mailto:support@zoltmount.com" style="color:#2563eb;">support@zoltmount.com</a></p>
            <p style="margin:0;">&copy; ${new Date().getFullYear()} ZoltMount. All rights reserved.</p>
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
