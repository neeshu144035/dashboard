import { type ChatbotIngestPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatbotIngestPayload
    
    // Echo back for testing
    return Response.json({
      ok: true,
      received: {
        organizationId: payload.organizationId,
        sessionId: payload.sessionId,
        userMessage: payload.userMessage,
        botResponse: payload.botResponse
      }
    })
  } catch (error) {
    console.error('Ingest error:', error)
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Invalid request',
      },
      { status: 400 }
    )
  }
}
