interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
}

export const onRequest: PagesFunction<Env>[] = [
  async (context) => {
    // Handle CORS preflight
    if (context.request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const response = await context.next()

    // Add CORS headers to all responses
    const newResponse = new Response(response.body, response)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })
    return newResponse
  },
]

// Helper: check admin key
export function requireAdmin(request: Request, env: Env): Response | null {
  const key = request.headers.get('X-Admin-Key')
  if (!key || key !== env.ADMIN_API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
  return null
}

// Helper: get collection from KV
export async function getCollection<T>(kv: KVNamespace, key: string): Promise<T[]> {
  const raw = await kv.get(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

// Helper: put collection to KV
export async function putCollection<T>(kv: KVNamespace, key: string, data: T[]): Promise<void> {
  await kv.put(key, JSON.stringify(data))
}

// Helper: JSON response
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
