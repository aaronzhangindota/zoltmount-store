interface ChatEnv {
  GEMINI_API_KEY: string
  [key: string]: unknown
}

export const onRequestPost: PagesFunction<ChatEnv> = async ({ request, env }) => {
  try {
    const apiKey = env.GEMINI_API_KEY
    const body: any = await request.json()
    const messages = body?.messages

    return new Response(JSON.stringify({
      reply: 'Debug: received ' + (messages?.length || 0) + ' messages, key=' + (apiKey ? 'set' : 'missing'),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: String(err?.message || err),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
