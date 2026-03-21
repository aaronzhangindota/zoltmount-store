import { requireAdmin, getCollection, putCollection, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

interface ContactSubmission {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  createdAt: string
  read: boolean
}

// GET /api/contact-submissions — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const submissions = await getCollection<ContactSubmission>(env.ZOLTMOUNT_KV, 'contact-submissions')
  return json(submissions)
}

// PUT /api/contact-submissions — admin: mark as read
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const { id } = await request.json() as any
  if (!id) return json({ error: 'Missing id' }, 400)

  const submissions = await getCollection<ContactSubmission>(env.ZOLTMOUNT_KV, 'contact-submissions')
  const item = submissions.find((s) => s.id === id)
  if (!item) return json({ error: 'Not found' }, 404)

  item.read = true
  await putCollection(env.ZOLTMOUNT_KV, 'contact-submissions', submissions)
  return json({ success: true })
}

// DELETE /api/contact-submissions — admin: delete submission
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const result = await requireAdmin(request, env)
  if ('denied' in result) return result.denied

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  let submissions = await getCollection<ContactSubmission>(env.ZOLTMOUNT_KV, 'contact-submissions')
  submissions = submissions.filter((s) => s.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, 'contact-submissions', submissions)
  return json({ success: true })
}

// POST /api/contact-submissions — public
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await request.json() as any

  if (!data.firstName || !data.lastName || !data.email || !data.message) {
    return json({ error: 'Missing required fields' }, 400)
  }

  const submission: ContactSubmission = {
    id: 'cs-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    subject: data.subject || 'General Inquiry',
    message: data.message,
    createdAt: new Date().toISOString(),
    read: false,
  }

  const submissions = await getCollection<ContactSubmission>(env.ZOLTMOUNT_KV, 'contact-submissions')
  submissions.unshift(submission) // newest first
  // Keep max 500 submissions
  if (submissions.length > 500) submissions.length = 500
  await putCollection(env.ZOLTMOUNT_KV, 'contact-submissions', submissions)

  return json(submission, 201)
}
