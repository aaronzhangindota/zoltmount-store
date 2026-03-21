import { getCollection, putCollection, requireSuperAdmin, writeLog, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

interface PaymentGateway {
  id: string
  provider: string
  displayName: string
  enabled: boolean
  testMode: boolean
  credentials: Record<string, string>
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// Mask sensitive credential values — show only last 4 chars
function maskCredentials(gw: PaymentGateway): PaymentGateway {
  const masked: Record<string, string> = {}
  for (const [key, value] of Object.entries(gw.credentials)) {
    if (!value) {
      masked[key] = ''
    } else if (value.length <= 8) {
      masked[key] = '••••••••'
    } else {
      masked[key] = '••••••••' + value.slice(-4)
    }
  }
  return { ...gw, credentials: masked }
}

// GET /api/payment-gateways — list all gateways (masked)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await requireSuperAdmin(context.request, context.env)
  if ('denied' in result) return result.denied

  const gateways = await getCollection<PaymentGateway>(context.env.ZOLTMOUNT_KV, 'payment-gateways')
  return json(gateways.map(maskCredentials))
}

// POST /api/payment-gateways — create a new gateway
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const result = await requireSuperAdmin(context.request, context.env)
  if ('denied' in result) return result.denied

  const body = await context.request.json() as Partial<PaymentGateway>
  if (!body.provider || !body.displayName) {
    return json({ error: 'provider and displayName are required' }, 400)
  }

  const kv = context.env.ZOLTMOUNT_KV
  const gateways = await getCollection<PaymentGateway>(kv, 'payment-gateways')

  const now = new Date().toISOString()
  const gateway: PaymentGateway = {
    id: 'gw-' + Date.now(),
    provider: body.provider,
    displayName: body.displayName,
    enabled: body.enabled ?? false,
    testMode: body.testMode ?? true,
    credentials: body.credentials || {},
    sortOrder: body.sortOrder ?? gateways.length,
    createdAt: now,
    updatedAt: now,
  }

  gateways.push(gateway)
  await putCollection(kv, 'payment-gateways', gateways)
  await writeLog(kv, result.auth, '添加收款网关', `${gateway.displayName} (${gateway.provider})`)

  return json(maskCredentials(gateway), 201)
}

// PUT /api/payment-gateways — update a gateway
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const result = await requireSuperAdmin(context.request, context.env)
  if ('denied' in result) return result.denied

  const body = await context.request.json() as Partial<PaymentGateway> & { id: string }
  if (!body.id) return json({ error: 'id is required' }, 400)

  const kv = context.env.ZOLTMOUNT_KV
  const gateways = await getCollection<PaymentGateway>(kv, 'payment-gateways')
  const index = gateways.findIndex((g) => g.id === body.id)
  if (index === -1) return json({ error: 'Gateway not found' }, 404)

  const existing = gateways[index]

  // For credentials: if a value is all dots (masked), keep the old value
  if (body.credentials) {
    const merged: Record<string, string> = { ...existing.credentials }
    for (const [key, value] of Object.entries(body.credentials)) {
      if (value && !value.startsWith('••••')) {
        merged[key] = value
      }
      // If empty string, clear it
      if (value === '') {
        merged[key] = ''
      }
    }
    body.credentials = merged
  }

  gateways[index] = {
    ...existing,
    displayName: body.displayName ?? existing.displayName,
    enabled: body.enabled ?? existing.enabled,
    testMode: body.testMode ?? existing.testMode,
    credentials: body.credentials ?? existing.credentials,
    sortOrder: body.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  }

  await putCollection(kv, 'payment-gateways', gateways)
  await writeLog(kv, result.auth, '更新收款网关', `${gateways[index].displayName}`)

  return json(maskCredentials(gateways[index]))
}

// DELETE /api/payment-gateways — delete a gateway
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const result = await requireSuperAdmin(context.request, context.env)
  if ('denied' in result) return result.denied

  const url = new URL(context.request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'id is required' }, 400)

  const kv = context.env.ZOLTMOUNT_KV
  const gateways = await getCollection<PaymentGateway>(kv, 'payment-gateways')
  const gateway = gateways.find((g) => g.id === id)
  if (!gateway) return json({ error: 'Gateway not found' }, 404)

  const filtered = gateways.filter((g) => g.id !== id)
  await putCollection(kv, 'payment-gateways', filtered)
  await writeLog(kv, result.auth, '删除收款网关', `${gateway.displayName}`)

  return json({ success: true })
}
