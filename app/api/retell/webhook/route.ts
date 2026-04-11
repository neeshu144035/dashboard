import Retell from 'retell-sdk'
import { ingestRetellPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

function getRetellWebhookKey() {
  const secret = process.env.RETELL_WEBHOOK_API_KEY ?? process.env.RETELL_API_KEY

  if (!secret) {
    throw new Error('Missing RETELL_WEBHOOK_API_KEY or RETELL_API_KEY')
  }

  return secret
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-retell-signature')

    if (!signature) {
      return Response.json({ error: 'Missing x-retell-signature header' }, { status: 401 })
    }

    const isValid = await Retell.verify(rawBody, getRetellWebhookKey(), signature)

    if (!isValid) {
      return Response.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as unknown
    const result = await ingestRetellPayload(payload)

    return Response.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to process Retell webhook',
      },
      { status: 500 }
    )
  }
}
