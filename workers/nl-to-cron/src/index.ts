import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

app.post('/', async (c) => {
  return c.json({ cron: null })
})

export default app
