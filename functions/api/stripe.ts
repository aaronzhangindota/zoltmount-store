import { getCollection, json } from './_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
  ADMIN_API_KEY: string
}

interface PaymentGateway {
  id: string
  provider: string
  displayName: string
  enabled: boolean
  testMode: boolean
  credentials: Record<string, string>
  sortOrder: number
  createdAt: string
  updatedAt: string
}

async function getStripeGateway(kv: KVNamespace): Promise<PaymentGateway | null> {
  const gateways = await getCollection<PaymentGateway>(kv, 'payment-gateways')
  return gateways.find((g) => g.provider === 'stripe' && g.enabled) || null
}

// GET /api/stripe?action=config → returns publishable key (public, no auth)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const action = url.searchParams.get('action')

  if (action === 'config') {
    const gateway = await getStripeGateway(context.env.ZOLTMOUNT_KV)
    if (!gateway) return json({ error: 'Stripe not configured' }, 404)

    const publishableKey = gateway.credentials.public_key
    if (!publishableKey) return json({ error: 'Stripe publishable key not set' }, 400)

    return json({ publishableKey })
  }

  return json({ error: 'Invalid action' }, 400)
}

// POST /api/stripe → create PaymentIntent (public, no auth)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = (await context.request.json()) as Record<string, unknown>

  if (body.action === 'create-payment-intent') {
    const gateway = await getStripeGateway(context.env.ZOLTMOUNT_KV)
    if (!gateway) return json({ error: 'Stripe not configured' }, 400)

    const secretKey = gateway.credentials.secret_key
    if (!secretKey) return json({ error: 'Stripe secret key not set' }, 400)

    const amount = body.amount as number
    const currency = (body.currency as string) || 'usd'
    if (!amount || amount <= 0) return json({ error: 'Invalid amount' }, 400)

    // Stripe expects amount in smallest currency unit (cents for USD)
    const amountInCents = Math.round(amount * 100)

    const params = new URLSearchParams()
    params.append('amount', String(amountInCents))
    params.append('currency', currency)
    params.append('payment_method_types[]', 'card')

    // Optional metadata
    if (body.metadata && typeof body.metadata === 'object') {
      for (const [key, value] of Object.entries(body.metadata as Record<string, string>)) {
        params.append(`metadata[${key}]`, String(value))
      }
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = (await stripeRes.json()) as Record<string, unknown>

    if (!stripeRes.ok) {
      const err = data.error as Record<string, string> | undefined
      return json({ error: err?.message || 'Stripe API error' }, stripeRes.status)
    }

    return json({
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
    })
  }

  return json({ error: 'Invalid action' }, 400)
}
