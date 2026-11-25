import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('hello vercel!, and thank you copilot for helping me write this code!.')
})

app.get('/marco', (c) => {
  return c.text('polo')
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
