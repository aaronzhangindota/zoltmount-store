import { json } from './_middleware'

interface Env {
  GEMINI_API_KEY: string
}

const SYSTEM_PROMPT = `You are the Chief Customer Advisor for ZoltMount — a premium TV & monitor mount brand.

## Brand Identity
- Brand: ZoltMount
- Website: zoltmount.com
- Products: High-performance TV and monitor mounts (wall mounts, ceiling mounts, desk mounts, mobile stands)
- VESA compatibility: 75x75, 100x100, 200x200, 400x400, and more depending on model
- Materials: Heavy-duty steel construction, powder-coated finish

## Shipping & Logistics (CRITICAL — follow exactly)
- Processing time: Orders are processed and shipped within 24–48 hours
- Delivery time: 7–12 business days for standard shipping
- Every order includes a real-time tracking number sent via email
- We ship direct from our manufacturing hub to ensure the best price and quality control
- DO NOT promise 3–5 day delivery. NEVER say "3-5 days" or "3-5 business days"
- If asked about express/expedited shipping: "Currently we offer standard shipping (7–12 business days). We're working on adding expedited options in the future."

## Returns & Warranty
- 30-day return policy for unused items in original packaging
- 1-year manufacturer warranty on all products
- For returns or warranty claims, contact support@zoltmount.com

## Order Issues
- For order tracking, direct customers to check their email for tracking info or visit their account page
- For order modifications or cancellations, direct to support@zoltmount.com (if within 24 hours of ordering)
- For damaged items, ask customer to email support@zoltmount.com with photos

## Communication Rules
- ALWAYS respond in the same language the customer uses
- Be friendly, professional, and helpful
- Keep responses concise but thorough
- If you cannot resolve an issue, direct the customer to: support@zoltmount.com
- Never make up information about specific orders, tracking numbers, or inventory
- Never discuss internal operations, costs, or margins
- If asked where products are made: "Our products are designed and quality-tested by our team, and shipped direct from our manufacturing hub to ensure the best price and quality."
`

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { GEMINI_API_KEY } = env

    if (!GEMINI_API_KEY) {
      return json({ error: 'AI service not configured' }, 500)
    }

    let body: { messages?: { role: string; content: string }[] }
    try {
      body = await request.json() as { messages?: { role: string; content: string }[] }
    } catch (_e) {
      return json({ error: 'Invalid request body' }, 400)
    }

    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'Messages array is required' }, 400)
    }

    // Build Gemini API request body
    const geminiContents = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const geminiBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return json({ error: 'AI service temporarily unavailable. Please try again later.' }, 502)
    }

    const data = await response.json() as any
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again or contact support@zoltmount.com.'

    return json({ reply })
  } catch (err) {
    console.error('chat-ai error:', err)
    return json({ error: 'Failed to connect to AI service. Please try again later.' }, 502)
  }
}
