import { ingestRetellPayload } from '@/lib/server-ingest'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    console.log('[retell/webhook] Received:', JSON.stringify(payload))

    const result = await ingestRetellPayload(payload)

    return Response.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    console.error('[retell/webhook] Error:', error)
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to process Retell webhook',
      },
      { status: 500 }
    )
  }
}
