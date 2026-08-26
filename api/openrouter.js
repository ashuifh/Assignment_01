// Vercel serverless proxy for OpenRouter. Keeps the API key server-side: the browser
// calls /api/openrouter, this function adds the Authorization header from the
// OPENROUTER_API_KEY environment variable and streams the response straight back.
// During local development the Vite dev server plays the same role (see vite.config.js);
// there the caller's own header is forwarded so either setup works unchanged.
const UPSTREAM = 'https://openrouter.ai/api/v1/chat/completions'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Only POST requests are supported.' } })
    return
  }
  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(req.body ?? {}),
    })
    const payload = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', 'application/json')
    res.send(payload)
  } catch (error) {
    console.error('openrouter proxy error:', error)
    res.status(502).json({ error: { message: `Could not reach OpenRouter: ${error?.message || error}` } })
  }
}
