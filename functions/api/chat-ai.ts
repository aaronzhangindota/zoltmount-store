export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ reply: 'AI service is working!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
