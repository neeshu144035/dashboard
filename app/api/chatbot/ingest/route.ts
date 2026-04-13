import { ingestChatbotPayload, type ChatbotIngestPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    let payload: ChatbotIngestPayload
    try {
      payload = (await request.json()) as ChatbotIngestPayload
    } catch (e) {
      return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('Chatbot payload received:', JSON.stringify(payload).slice(0, 500))

    const result = await ingestChatbotPayload(payload)

    return Response.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    console.error('Chatbot ingest error:', error)
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to ingest chatbot payload',
      },
      { status: 500 }
    )
  }
}
