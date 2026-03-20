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
