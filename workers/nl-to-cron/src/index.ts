import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.post('/', async (c) => {
  try {
    const body = await c.req.json<{ input?: string }>()
    const input = body.input?.trim()

    if (!input) {
      return c.json({ cron: null })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_completion_tokens: 30,
        messages: [
          {
            role: 'system',
            content:
              'Convert the user\'s natural language schedule description into a standard 5-field cron expression (minute hour day-of-month month day-of-week). Reply with ONLY the cron expression, nothing else. If the input cannot be converted to a valid cron expression, reply with exactly: null',
          },
          { role: 'user', content: input },
        ],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return c.json({ cron: null, error: `LLM request failed: ${response.status}` }, 500)
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[]
    }

    const raw = data.choices?.[0]?.message?.content?.trim()

    if (!raw || raw === 'null') {
      return c.json({ cron: null })
    }

    // Validate it looks like a 5-field cron expression
    const fields = raw.split(/\s+/)
    if (fields.length !== 5) {
      return c.json({ cron: null })
    }

    return c.json({ cron: raw })
  } catch (e) {
    return c.json({ cron: null, error: String(e) }, 500)
  }
})

export default app
