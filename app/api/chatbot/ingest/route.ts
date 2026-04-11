import { ingestChatbotPayload, type ChatbotIngestPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

function getChatbotSecret() {
  const secret = process.env.CHATBOT_INGEST_SECRET

  if (!secret) {
    throw new Error('Missing CHATBOT_INGEST_SECRET')
  }

  return secret
}

export async function POST(request: Request) {
  try {
    const providedSecret = request.headers.get('x-ingest-secret')

    if (providedSecret !== getChatbotSecret()) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await request.json()) as ChatbotIngestPayload
    const result = await ingestChatbotPayload(payload)

    return Response.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to ingest chatbot payload',
      },
      { status: 500 }
    )
  }
}
