import { json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  TRACK17_API_KEY: string
}

// POST /api/tracking/query — 公开端点，输入单号查物流（IP 频率限制 5次/分钟）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // IP 频率限制
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  const rateKey = `rate:tracking:${ip}`
  const currentCount = parseInt(await env.ZOLTMOUNT_KV.get(rateKey) || '0', 10)
  if (currentCount >= 5) {
    return json({ error: 'Too many requests. Please try again later.' }, 429)
  }
  await env.ZOLTMOUNT_KV.put(rateKey, String(currentCount + 1), { expirationTtl: 60 })

  const { number } = await request.json() as { number: string }
  if (!number || !number.trim()) {
    return json({ error: 'Tracking number is required' }, 400)
  }

  const trackingNumber = number.trim()

  if (!env.TRACK17_API_KEY) {
    return json({ error: '17TRACK API Key not configured' }, 500)
  }

  // 检查 KV 缓存（10分钟）
  const cacheKey = `tracking-cache:${trackingNumber}`
  const cached = await env.ZOLTMOUNT_KV.get(cacheKey)
  if (cached) {
    try {
      return json(JSON.parse(cached))
    } catch {}
  }

  try {
    const res = await fetch('https://api.17track.net/track/v2.2/gettrackinfo', {
      method: 'POST',
      headers: {
        '17token': env.TRACK17_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ number: trackingNumber }]),
    })

    const data = await res.json() as any
    const trackInfo = data?.data?.accepted?.[0] || data?.data?.rejected?.[0] || null

    const result = {
      number: trackingNumber,
      carrier: trackInfo?.track?.w1 || '',
      status: trackInfo?.track?.e ?? null,
      events: (trackInfo?.track?.z0?.z ?? []).map((evt: any) => ({
        time: evt.a,
        description: evt.z,
        location: evt.c || '',
      })),
      lastEvent: trackInfo?.track?.z0?.z?.[0]?.z || null,
      lastTime: trackInfo?.track?.z0?.z?.[0]?.a || null,
    }

    // 写入缓存（10分钟）
    await env.ZOLTMOUNT_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 600 })

    return json(result)
  } catch (err: any) {
    return json({ error: 'Failed to query tracking info', detail: err.message }, 502)
  }
}
