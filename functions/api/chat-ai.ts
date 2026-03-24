// Minimal test version to debug 502
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const body = await request.json() as any
    const messages = body?.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const GEMINI_API_KEY = (env as any).GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set', envKeys: Object.keys(env) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const geminiBody = {
      system_instruction: {
        parts: [{ text: 'You are a helpful customer support agent for ZoltMount, a TV mount brand. Be concise and friendly.' }],
      },
      contents: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: 'Gemini error', status: res.status, detail: errText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json() as any
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', message: err?.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
