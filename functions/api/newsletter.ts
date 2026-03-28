import { requireAdmin, getCollection, putCollection, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
  MAILERLITE_API_TOKEN: string
}

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
}

const ML_API = 'https://connect.mailerlite.com/api'

// Helper: add a single subscriber to MailerLite
async function addToMailerLite(env: Env, email: string): Promise<boolean> {
  if (!env.MAILERLITE_API_TOKEN) return false
  try {
    const res = await fetch(`${ML_API}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`,
      },
      body: JSON.stringify({ email, status: 'active' }),
    })
    return res.ok || res.status === 409 // 409 = already exists
  } catch {
    return false
  }
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

  // Also add to MailerLite (fire-and-forget, don't block response)
  addToMailerLite(env, email).catch(() => {})

  return json({ success: true }, 201)
}

// PATCH /api/newsletter — admin: bulk sync all KV subscribers to MailerLite
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  if (!env.MAILERLITE_API_TOKEN) {
    return json({ error: 'MAILERLITE_API_TOKEN not configured' }, 500)
  }

  const subscribers = await getCollection<Subscriber>(env.ZOLTMOUNT_KV, 'newsletter')
  let synced = 0
  let failed = 0

  // Sync in batches of 10 to avoid rate limits
  for (let i = 0; i < subscribers.length; i += 10) {
    const batch = subscribers.slice(i, i + 10)
    const results = await Promise.allSettled(
      batch.map((s) => addToMailerLite(env, s.email))
    )
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) synced++
      else failed++
    })
  }

  return json({ success: true, total: subscribers.length, synced, failed })
}
