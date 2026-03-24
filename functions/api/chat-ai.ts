interface ChatEnv {
  GEMINI_API_KEY: string
  [key: string]: unknown
}

export const onRequestPost: PagesFunction<ChatEnv> = async ({ request, env }) => {
  try {
    const apiKey = env.GEMINI_API_KEY
    const body: any = await request.json()
    const messages = body?.messages

    if (!apiKey || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request or missing key' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Test: simple fetch to Gemini API
    const testBody = {
      contents: [{ role: 'user', parts: [{ text: 'Say hello in one word' }] }],
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBody),
    })

    const text = await res.text()

    return new Response(JSON.stringify({
      fetchStatus: res.status,
      fetchOk: res.ok,
      body: text.substring(0, 500),
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: 'catch',
      name: err?.name,
      message: String(err?.message || err),
      stack: String(err?.stack || '').substring(0, 300),
    }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
