import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { input } = (await req.json()) as { input?: string }
    const trimmed = input?.trim()

    if (!trimmed) {
      return NextResponse.json({ cron: null })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ cron: null, error: 'Missing API key' }, { status: 500 })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
          { role: 'user', content: trimmed },
        ],
      }),
    })

    const text = await response.text()

    if (!response.ok) {
      return NextResponse.json({ cron: null, error: `LLM request failed: ${response.status}` }, { status: 500 })
    }

    const data = JSON.parse(text) as {
      choices: { message: { content: string } }[]
    }

    const raw = data.choices?.[0]?.message?.content?.trim()

    if (!raw || raw === 'null') {
      return NextResponse.json({ cron: null })
    }

    const fields = raw.split(/\s+/)
    if (fields.length !== 5) {
      return NextResponse.json({ cron: null })
    }

    return NextResponse.json({ cron: raw })
  } catch {
    return NextResponse.json({ cron: null, error: 'Internal error' }, { status: 500 })
  }
}
