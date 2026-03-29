import { requireAdmin, json, writeLog } from '../_middleware'
import { getCarrierCode } from './_carrier-map'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
  TRACK17_API_KEY: string
}

// POST /api/tracking/register — 管理员手动注册运单到 17TRACK
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const { trackingNumber, carrier } = await request.json() as { trackingNumber: string; carrier?: string }
  if (!trackingNumber) {
    return json({ error: '缺少运单号' }, 400)
  }

  if (!env.TRACK17_API_KEY) {
    return json({ error: '17TRACK API Key 未配置' }, 500)
  }

  const carrierCode = carrier ? getCarrierCode(carrier) : undefined

  try {
    const body: any[] = [{ number: trackingNumber }]
    if (carrierCode) {
      body[0].carrier = carrierCode
    } else if (carrier) {
      body[0].auto_detection = true
    }

    const res = await fetch('https://api.17track.net/track/v2.2/register', {
      method: 'POST',
      headers: {
        '17token': env.TRACK17_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json() as any

    // 保存注册元数据到 KV（90天TTL）
    await env.ZOLTMOUNT_KV.put(
      `tracking:${trackingNumber}`,
      JSON.stringify({ carrier: carrier || 'auto', carrierCode, registeredAt: new Date().toISOString() }),
      { expirationTtl: 90 * 24 * 3600 }
    )

    await writeLog(env.ZOLTMOUNT_KV, result.auth, `手动注册运单 ${trackingNumber} 到 17TRACK`, 'tracking')

    return json({ success: true, data })
  } catch (err: any) {
    return json({ error: '17TRACK 注册失败', detail: err.message }, 502)
  }
}
