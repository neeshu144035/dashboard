import { ingestChatbotPayload, type ChatbotIngestPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatbotIngestPayload
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
