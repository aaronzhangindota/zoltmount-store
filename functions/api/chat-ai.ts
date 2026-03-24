interface ChatEnv {
  GEMINI_API_KEY: string
  [key: string]: unknown
}

export const onRequestPost: PagesFunction<ChatEnv> = async ({ request, env }) => {
  try {
    const apiKey = env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    const body: any = await request.json()
    const messages = body?.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    const geminiBody = {
      system_instruction: {
        parts: [{ text: 'You are a helpful customer support agent for ZoltMount, a TV mount brand. Be concise.' }],
      },
      contents: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.content || '') }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: 'Gemini error', status: res.status, detail: errText }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      })
    }

    const data: any = await res.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', message: String(err?.message || err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
