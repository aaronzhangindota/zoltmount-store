interface Env {
  ZOLTMOUNT_KV: KVNamespace
  MAILERLITE_API_TOKEN: string
}

const ML_API = 'https://connect.mailerlite.com/api'
const SHOP_KV_KEY = 'mailerlite-shop-id'

async function getOrCreateShop(env: Env): Promise<string> {
  // Try reading from KV first
  const cached = await env.ZOLTMOUNT_KV.get(SHOP_KV_KEY)
  if (cached) return cached

  // Create shop
  const res = await fetch(`${ML_API}/ecommerce/shops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`,
    },
    body: JSON.stringify({
      name: 'ZoltMount',
      url: 'https://zoltmount.com',
      currency: 'USD',
    }),
  })

  if (!res.ok) {
    // If shop already exists, try to list and pick the first one
    const listRes = await fetch(`${ML_API}/ecommerce/shops`, {
      headers: { Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}` },
    })
    if (listRes.ok) {
      const listData = (await listRes.json()) as any
      const shops = listData.data
      if (shops && shops.length > 0) {
        const shopId = shops[0].id
        await env.ZOLTMOUNT_KV.put(SHOP_KV_KEY, shopId)
        return shopId
      }
    }
    throw new Error(`Failed to create/list MailerLite shop: ${res.status}`)
  }

  const data = (await res.json()) as any
  const shopId = data.data.id
  await env.ZOLTMOUNT_KV.put(SHOP_KV_KEY, shopId)
  return shopId
}

// POST — Create pending (abandoned cart) order
async function handlePost(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as {
    email: string
    firstName: string
    lastName: string
    cartItems: { name: string; price: number; quantity: number; productId: string }[]
    cartTotal: number
  }

  if (!body.email || !body.cartItems?.length) {
    return new Response(JSON.stringify({ error: 'Missing email or cartItems' }), { status: 400 })
  }

  const shopId = await getOrCreateShop(env)

  const res = await fetch(`${ML_API}/ecommerce/shops/${shopId}/orders/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`,
    },
    body: JSON.stringify({
      customer: {
        email: body.email,
        create_subscriber: true,
        accepts_marketing: true,
        fields: {
          name: body.firstName,
          last_name: body.lastName,
        },
      },
      cart: {
        items: body.cartItems.map((item) => ({
          ecommerce_product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      status: 'pending',
      total_price: body.cartTotal,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    return new Response(JSON.stringify({ error: 'MailerLite API error', detail: errText }), { status: 502 })
  }

  const data = (await res.json()) as any
  return new Response(JSON.stringify({ mlOrderId: data.data?.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// PUT — Mark order as complete (cancels abandoned cart automation)
async function handlePut(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as { orderId: string }

  if (!body.orderId) {
    return new Response(JSON.stringify({ error: 'Missing orderId' }), { status: 400 })
  }

  const shopId = await getOrCreateShop(env)

  const res = await fetch(`${ML_API}/ecommerce/shops/${shopId}/orders/${body.orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`,
    },
    body: JSON.stringify({ status: 'complete' }),
  })

  if (!res.ok) {
    const errText = await res.text()
    return new Response(JSON.stringify({ error: 'MailerLite API error', detail: errText }), { status: 502 })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.MAILERLITE_API_TOKEN) {
    return new Response(JSON.stringify({ error: 'MAILERLITE_API_TOKEN not configured' }), { status: 500 })
  }

  try {
    if (request.method === 'POST') return await handlePost(request, env)
    if (request.method === 'PUT') return await handlePut(request, env)
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500 })
  }
}
