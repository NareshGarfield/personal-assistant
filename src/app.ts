import { Hono } from 'hono'
import { env } from 'hono/adapter'

const app = new Hono()

type AppEnvironment = {
  FIRECRAWL_API_KEY?: string
  SCRAPE_API_TOKEN?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_WEBHOOK_SECRET?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

app.get('/', (c) => {
  return c.text('hello vercel!, and thank you copilot for helping me write this code!.')
})

app.get('/marco', (c) => {
  return c.text('polo')
})

app.post('/api/scrape', async (c) => {
  const { FIRECRAWL_API_KEY: firecrawlApiKey, SCRAPE_API_TOKEN: scrapeApiToken } =
    env<AppEnvironment>(c)

  if (!firecrawlApiKey || !scrapeApiToken) {
    return c.json({ error: 'Firecrawl scraping is not configured' }, 503)
  }

  if (c.req.header('authorization') !== `Bearer ${scrapeApiToken}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({ error: 'Request body must be valid JSON' }, 400)
    }
    throw error
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('url' in body) ||
    typeof body.url !== 'string'
  ) {
    return c.json({ error: 'Request body must include a URL string' }, 400)
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(body.url)
  } catch (error) {
    if (error instanceof TypeError) {
      return c.json({ error: 'URL must be a valid absolute URL' }, 400)
    }
    throw error
  }

  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return c.json({ error: 'URL must use HTTP or HTTPS' }, 400)
  }

  let firecrawlResponse: Response
  try {
    firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: targetUrl.href,
        formats: ['markdown']
      })
    })
  } catch (error) {
    console.error('Failed to reach Firecrawl', error)
    return c.json({ error: 'Failed to reach Firecrawl' }, 502)
  }

  let result: unknown
  try {
    result = await firecrawlResponse.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Firecrawl returned an invalid JSON response')
      return c.json({ error: 'Firecrawl returned an invalid response' }, 502)
    }
    throw error
  }

  if (!firecrawlResponse.ok) {
    return c.json({ error: 'Firecrawl request failed', details: result }, 502)
  }

  return c.json(result)
})

app.post('/api/telegram/webhook', async (c) => {
  const { TELEGRAM_BOT_TOKEN: botToken, TELEGRAM_WEBHOOK_SECRET: webhookSecret } =
    env<AppEnvironment>(c)

  if (!botToken || !webhookSecret) {
    return c.json({ error: 'Telegram webhook is not configured' }, 503)
  }

  if (c.req.header('X-Telegram-Bot-Api-Secret-Token') !== webhookSecret) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let update: unknown
  try {
    update = await c.req.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({ error: 'Request body must be valid JSON' }, 400)
    }
    throw error
  }

  if (!isRecord(update)) {
    return c.json({ error: 'Invalid Telegram update' }, 400)
  }

  if (update.message === undefined) {
    return c.json({ ok: true })
  }

  if (!isRecord(update.message) || !isRecord(update.message.chat)) {
    return c.json({ error: 'Invalid Telegram message update' }, 400)
  }

  const chatId = update.message.chat.id
  const text = update.message.text

  if (typeof chatId !== 'number') {
    return c.json({ error: 'Invalid Telegram chat ID' }, 400)
  }

  if (typeof text !== 'string') {
    return c.json({ ok: true })
  }

  let telegramResponse: Response
  try {
    telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    })
  } catch (error) {
    console.error('Failed to reach the Telegram Bot API', error)
    return c.json({ error: 'Failed to reach the Telegram Bot API' }, 502)
  }

  if (!telegramResponse.ok) {
    console.error('Telegram sendMessage failed with status', telegramResponse.status)
    return c.json({ error: 'Telegram failed to send the echo message' }, 502)
  }

  return c.json({ ok: true })
})

app.get('/image', (c) => {
  return c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Image</title>
    <style>
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
      img { width: 100%; height: 100%; object-fit: cover; display: block; }
    </style>
  </head>
  <body>
    <img src="https://fwmedia.fandomwire.com/wp-content/uploads/2025/07/24033759/luffy-1.jpg" alt="Luffy" />
  </body>
</html>`)
})


export default app
