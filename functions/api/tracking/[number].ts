import { requireUser, getCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  TRACK17_API_KEY: string
}

// GET /api/tracking/:number — 已登录用户查询物流轨迹（验证运单归属）
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const userResult = await requireUser(request, env.ZOLTMOUNT_KV)
  if ('denied' in userResult) return userResult.denied

  const number = params.number as string
  if (!number) return json({ error: '缺少运单号' }, 400)

  if (!env.TRACK17_API_KEY) {
    return json({ error: '17TRACK API Key 未配置' }, 500)
  }

  // 验证运单属于该用户
  const orders = await getCollection<any>(env.ZOLTMOUNT_KV, 'orders')
  const userOrder = orders.find(
    (o: any) => o.trackingNumber === number && o.userId === userResult.user.id
  )
  if (!userOrder) {
    return json({ error: '运单不属于当前用户' }, 403)
  }

  // 检查 KV 缓存（10分钟）
  const cacheKey = `tracking-cache:${number}`
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
      body: JSON.stringify([{ number }]),
    })

    const data = await res.json() as any
    const trackInfo = data?.data?.accepted?.[0] || data?.data?.rejected?.[0] || null

    const result = {
      number,
      carrier: userOrder.carrier || '',
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
    return json({ error: '查询 17TRACK 失败', detail: err.message }, 502)
  }
}
