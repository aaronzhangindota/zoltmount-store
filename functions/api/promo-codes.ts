import { requireAdmin, getCollection, putCollection, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export interface PromoCode {
  id: string
  code: string
  discountPercent: number
  active: boolean
  usageLimit: number | null    // null = unlimited
  usedCount: number
  minOrderAmount: number       // minimum order subtotal to apply
  createdAt: string
}

const KV_KEY = 'promo-codes'

// Seed default ZOLT15 if collection is empty
async function ensureDefaults(kv: KVNamespace): Promise<PromoCode[]> {
  let codes = await getCollection<PromoCode>(kv, KV_KEY)
  if (codes.length === 0) {
    codes = [
      {
        id: 'pc-zolt10',
        code: 'ZOLT10',
        discountPercent: 10,
        active: true,
        usageLimit: null,
        usedCount: 0,
        minOrderAmount: 0,
        createdAt: new Date().toISOString(),
      },
    ]
    await putCollection(kv, KV_KEY, codes)
  }
  return codes
}

// GET /api/promo-codes — admin: list all promo codes
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const codes = await ensureDefaults(env.ZOLTMOUNT_KV)
  return json(codes)
}

// POST /api/promo-codes — public: validate a promo code
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await request.json() as any
  const inputCode = (data.code || '').trim().toUpperCase()

  if (!inputCode) return json({ error: 'Missing code' }, 400)

  const codes = await ensureDefaults(env.ZOLTMOUNT_KV)
  const promo = codes.find((c) => c.code === inputCode && c.active)

  if (!promo) {
    return json({ valid: false, error: 'Invalid or expired promo code' })
  }

  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return json({ valid: false, error: 'This promo code has reached its usage limit' })
  }

  return json({
    valid: true,
    code: promo.code,
    discountPercent: promo.discountPercent,
    minOrderAmount: promo.minOrderAmount,
  })
}

// PUT /api/promo-codes — admin: create or update promo code
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const data = await request.json() as Partial<PromoCode> & { code: string }
  if (!data.code) return json({ error: 'Missing code' }, 400)

  const codes = await ensureDefaults(env.ZOLTMOUNT_KV)
  const existing = codes.find((c) => c.id === data.id)

  if (existing) {
    Object.assign(existing, {
      code: (data.code || existing.code).toUpperCase(),
      discountPercent: data.discountPercent ?? existing.discountPercent,
      active: data.active ?? existing.active,
      usageLimit: data.usageLimit !== undefined ? data.usageLimit : existing.usageLimit,
      minOrderAmount: data.minOrderAmount ?? existing.minOrderAmount,
    })
  } else {
    codes.push({
      id: 'pc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      code: data.code.toUpperCase(),
      discountPercent: data.discountPercent ?? 10,
      active: data.active ?? true,
      usageLimit: data.usageLimit ?? null,
      usedCount: 0,
      minOrderAmount: data.minOrderAmount ?? 0,
      createdAt: new Date().toISOString(),
    })
  }

  await putCollection(env.ZOLTMOUNT_KV, KV_KEY, codes)
  return json({ success: true })
}

// DELETE /api/promo-codes?id=xxx — admin: delete a promo code
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  let codes = await getCollection<PromoCode>(env.ZOLTMOUNT_KV, KV_KEY)
  codes = codes.filter((c) => c.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, KV_KEY, codes)
  return json({ success: true })
}

// PATCH /api/promo-codes — internal: increment usage count (called after order placed)
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const data = await request.json() as { code: string }
  const inputCode = (data.code || '').trim().toUpperCase()
  if (!inputCode) return json({ error: 'Missing code' }, 400)

  const codes = await getCollection<PromoCode>(env.ZOLTMOUNT_KV, KV_KEY)
  const promo = codes.find((c) => c.code === inputCode)
  if (promo) {
    promo.usedCount += 1
    await putCollection(env.ZOLTMOUNT_KV, KV_KEY, codes)
  }
  return json({ success: true })
}
