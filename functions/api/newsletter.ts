import { requireAdmin, getCollection, putCollection, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
}

// GET /api/newsletter — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const subscribers = await getCollection<Subscriber>(env.ZOLTMOUNT_KV, 'newsletter')
  return json(subscribers)
}

// DELETE /api/newsletter — admin: delete subscriber
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  let subscribers = await getCollection<Subscriber>(env.ZOLTMOUNT_KV, 'newsletter')
  subscribers = subscribers.filter((s) => s.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'newsletter', subscribers)
  return json({ success: true })
}

// POST /api/newsletter — public
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await request.json() as any
  const email = data.email?.trim()?.toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email' }, 400)
  }

  const subscribers = await getCollection<Subscriber>(env.ZOLTMOUNT_KV, 'newsletter')

  // Check duplicate
  if (subscribers.some((s) => s.email === email)) {
    return json({ success: true, message: 'Already subscribed' })
  }

  subscribers.unshift({
    id: 'ns-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    email,
    subscribedAt: new Date().toISOString(),
  })

  await putCollection(env.ZOLTMOUNT_KV, 'newsletter', subscribers)
  return json({ success: true }, 201)
}
