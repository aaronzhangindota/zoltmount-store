import { getCollection, putCollection, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

export interface Review {
  id: string
  productId: string
  userId?: string
  name: string
  rating: number       // 1-5
  title: string
  content: string
  verified: boolean    // purchased this product
  createdAt: string
}

const KV_KEY = 'reviews'

// GET /api/reviews?productId=xxx — public: get reviews for a product
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const productId = url.searchParams.get('productId')

  const reviews = await getCollection<Review>(env.ZOLTMOUNT_KV, KV_KEY)

  if (productId) {
    return json(reviews.filter((r) => r.productId === productId))
  }
  return json(reviews)
}

// POST /api/reviews — public: submit a review
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await request.json() as any

  const productId = data.productId?.trim()
  const name = data.name?.trim()
  const rating = Number(data.rating)
  const title = data.title?.trim() || ''
  const content = data.content?.trim()

  if (!productId || !name || !content) {
    return json({ error: 'Missing required fields (productId, name, content)' }, 400)
  }
  if (!rating || rating < 1 || rating > 5) {
    return json({ error: 'Rating must be 1-5' }, 400)
  }

  const reviews = await getCollection<Review>(env.ZOLTMOUNT_KV, KV_KEY)

  const review: Review = {
    id: 'rv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    productId,
    userId: data.userId || undefined,
    name,
    rating,
    title,
    content,
    verified: !!data.verified,
    createdAt: new Date().toISOString(),
  }

  reviews.unshift(review)
  await putCollection(env.ZOLTMOUNT_KV, KV_KEY, reviews)

  return json({ success: true, review }, 201)
}

// DELETE /api/reviews?id=xxx — admin: delete a review
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  // Simple admin check via header
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing id' }, 400)

  let reviews = await getCollection<Review>(env.ZOLTMOUNT_KV, KV_KEY)
  reviews = reviews.filter((r) => r.id !== id)
  await putCollection(env.ZOLTMOUNT_KV, KV_KEY, reviews)

  return json({ success: true })
}
