import { requireAdmin, writeLog } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ZOLTMOUNT_R2: R2Bucket
  ADMIN_API_KEY: string
}

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // Require admin auth
  const result = await requireAdmin(request, env as any)
  if ('denied' in result) return result.denied

  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return new Response(JSON.stringify({ error: '需要 multipart/form-data 格式' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return new Response(JSON.stringify({ error: '未找到文件' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Validate file type
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return new Response(JSON.stringify({ error: '仅支持 JPG、PNG、WebP 格式' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: '文件大小不能超过 5MB' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Generate unique filename
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const key = `products/${timestamp}-${random}.${ext}`

  // Upload to R2
  await env.ZOLTMOUNT_R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  // Build public URL — uses R2 custom domain or public access URL
  // The user needs to configure R2 public access in Cloudflare dashboard
  const url = `https://r2.zoltmount.com/${key}`

  await writeLog(env.ZOLTMOUNT_KV, result.auth, 'upload', `图片上传: ${key}`)

  return new Response(JSON.stringify({ url, key }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
