import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('hello vercel')
})

export default app
