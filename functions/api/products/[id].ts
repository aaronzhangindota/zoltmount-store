import { requireAdmin, getCollection, putCollection, json, writeLog } from '../_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

// PUT /api/products/:id — admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const data = await request.json() as any
  const products = await getCollection<any>(env.ZOLTMOUNT_KV, 'products')
  const idx = products.findIndex((p: any) => p.id === id)
  if (idx === -1) {
    const newProduct = { ...data, id }
    products.push(newProduct)
    await putCollection(env.ZOLTMOUNT_KV, 'products', products)
    await writeLog(env.ZOLTMOUNT_KV, result.auth, `创建商品「${newProduct.name || id}」`, 'products')
    return json(newProduct, 201)
  }

  products[idx] = { ...products[idx], ...data }
  await putCollection(env.ZOLTMOUNT_KV, 'products', products)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `更新商品「${products[idx].name || id}」`, 'products')
  return json(products[idx])
}

// DELETE /api/products/:id — admin only
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const id = params.id as string
  const products = await getCollection<any>(env.ZOLTMOUNT_KV, 'products')
  const product = products.find((p: any) => p.id === id)
  const filtered = products.filter((p: any) => p.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'products', filtered)
  await writeLog(env.ZOLTMOUNT_KV, result.auth, `删除商品「${product?.name || id}」`, 'products')
  return json({ success: true })
}
