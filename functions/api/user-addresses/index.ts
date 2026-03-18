import { putCollection, json, requireUser } from '../_middleware'
import type { Address } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
}

// POST: add a new address (requires X-User-Token)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const kv = context.env.ZOLTMOUNT_KV
  const result = await requireUser(context.request, kv)
  if ('denied' in result) return result.denied

  const { user, users } = result
  const body = await context.request.json() as Omit<Address, 'id'>

  const newAddr: Address = {
    ...body,
    id: `addr-${Date.now()}`,
  }

  // If first address or marked as default, set it as default
  if (user.addresses.length === 0 || newAddr.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false))
    newAddr.isDefault = true
  }

  user.addresses.push(newAddr)
  await putCollection(kv, 'users', users)

  return json({ address: newAddr })
}
