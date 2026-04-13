import { ingestChatbotPayload, type ChatbotIngestPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let rawBody: string | undefined

  try {
    rawBody = await request.text()
    console.log('[chatbot/ingest] Raw body:', rawBody)

    const payload = JSON.parse(rawBody) as ChatbotIngestPayload

    if (!payload.organizationId) {
      return Response.json(
        { ok: false, error: 'Missing organizationId' },
        { status: 400 }
      )
    }

    if (!payload.sessionId && !payload.session?.externalId) {
      return Response.json(
        { ok: false, error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    const result = await ingestChatbotPayload(payload)

    console.log('[chatbot/ingest] Success:', JSON.stringify(result))

    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error('[chatbot/ingest] Error:', error)
    console.error('[chatbot/ingest] Raw body was:', rawBody)

    const message =
      error instanceof Error ? error.message : 'Unable to ingest chatbot payload'

    return Response.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
