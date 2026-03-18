import { putCollection, json, requireUser, sanitizeUser } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
}

// PUT: update an address (requires X-User-Token)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const kv = context.env.ZOLTMOUNT_KV
  const addrId = context.params.id as string
  const result = await requireUser(context.request, kv)
  if ('denied' in result) return result.denied

  const { user, users } = result
  const body = await context.request.json() as Record<string, any>

  const idx = user.addresses.findIndex((a) => a.id === addrId)
  if (idx === -1) {
    return json({ error: 'Address not found' }, 404)
  }

  // If setting as default, clear other defaults
  if (body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false))
  }

  user.addresses[idx] = { ...user.addresses[idx], ...body, id: addrId }
  await putCollection(kv, 'users', users)

  return json({ user: sanitizeUser(user) })
}

// DELETE: remove an address (requires X-User-Token)
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const kv = context.env.ZOLTMOUNT_KV
  const addrId = context.params.id as string
  const result = await requireUser(context.request, kv)
  if ('denied' in result) return result.denied

  const { user, users } = result
  const idx = user.addresses.findIndex((a) => a.id === addrId)
  if (idx === -1) {
    return json({ error: 'Address not found' }, 404)
  }

  user.addresses.splice(idx, 1)
  await putCollection(kv, 'users', users)

  return json({ user: sanitizeUser(user) })
}
