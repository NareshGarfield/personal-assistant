Prerequisites:

- [Vercel CLI](https://vercel.com/docs/cli) installed globally

To develop locally:

```
npm install
vc dev
```

```
open http://localhost:3000
```

To build locally:

```
npm install
vc build
```

To deploy:

```
npm install
vc deploy
```

## Firecrawl

Set `FIRECRAWL_API_KEY` and `SCRAPE_API_TOKEN` in your local environment or
deployment settings. Keep both values server-side; the scrape token protects
the endpoint from unauthorized use.

Send a `POST` request to `/api/scrape` with a bearer token and a JSON URL:

```sh
curl -X POST http://localhost:3000/api/scrape \
  -H "Authorization: Bearer $SCRAPE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

The endpoint returns Firecrawl's response with the page content in Markdown.

## Telegram echo bot

The local dev command loads `src/.env`. Set `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_WEBHOOK_SECRET` there, or configure them in your deployment
environment.

Deploy the app to an HTTPS URL, then configure Telegram's
[`setWebhook`](https://core.telegram.org/bots/api#setwebhook) method with
`https://<your-domain>/api/telegram/webhook`, the same
`TELEGRAM_WEBHOOK_SECRET` as `secret_token`, and `allowed_updates` set to
`["message"]`. Telegram sends that secret in the
`X-Telegram-Bot-Api-Secret-Token` header. The webhook echoes text messages via
[`sendMessage`](https://core.telegram.org/bots/api#sendmessage); non-text
updates are acknowledged without a reply.
