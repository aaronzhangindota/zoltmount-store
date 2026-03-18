import { requireAdmin, getCollection, putCollection, json } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// PUT /api/products/:id — admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const id = params.id as string
  const data = await request.json()
  const products = await getCollection<any>(env.ZOLTMOUNT_KV, 'products')
  const idx = products.findIndex((p: any) => p.id === id)
  if (idx === -1) {
    // Upsert: if not found, add it
    const newProduct = { ...data, id }
    products.push(newProduct)
    await putCollection(env.ZOLTMOUNT_KV, 'products', products)
    return json(newProduct, 201)
  }

  products[idx] = { ...products[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'products', products)
  return json(products[idx])
}

// DELETE /api/products/:id — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const denied = requireAdmin(request, env)
  if (denied) return denied

  const id = params.id as string
  const products = await getCollection<any>(env.ZOLTMOUNT_KV, 'products')
  const filtered = products.filter((p: any) => p.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'products', filtered)
  return json({ success: true })
}
