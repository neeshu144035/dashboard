import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

type JsonRecord = Record<string, unknown>

type LeadRow = {
  id: string
  source: string
  external_lead_id: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  phone_normalized: string | null
  notes: string | null
  metadata: JsonRecord | null
}

type ChatSessionRow = {
  id: string
  started_at: string
}

type VoiceCallRow = {
  id: string
}

export type ChatbotLeadInput = {
  externalLeadId?: string
  fullName?: string
  email?: string
  phone?: string
  notes?: string
  metadata?: JsonRecord
}

export type ChatbotMessageInput = {
  externalId?: string
  role?: string
  direction?: string
  content: string
  sentAt?: string
  metadata?: JsonRecord
}

export type ChatbotIngestPayload = {
  organizationId: string
  eventId?: string
  eventType?: string
  source?: string
  sessionId?: string
  session?: {
    externalId?: string
    channel?: string
    status?: string
    summary?: string
    startedAt?: string
    lastMessageAt?: string
    metadata?: JsonRecord
  }
  lead?: ChatbotLeadInput
  messages?: ChatbotMessageInput[]
  // Allow simple format from n8n
  userMessage?: string
  botResponse?: string | { message?: string; [key: string]: unknown }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {}
}

function asTrimmedString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function coerceTimestamp(value: unknown, fallback = new Date().toISOString()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  if (typeof value === 'number') {
    const fromNumber = new Date(value)
    if (!Number.isNaN(fromNumber.getTime())) {
      return fromNumber.toISOString()
    }
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return fallback
}

function normalizePhone(value: unknown) {
  const phone = asTrimmedString(value)
  if (!phone) {
    return undefined
  }

  const hasPlus = phone.startsWith('+')
  const digits = phone.replace(/\D/g, '')

  if (!digits) {
    return undefined
  }

  return hasPlus ? `+${digits}` : digits
}

function mergeMetadata(current: unknown, next: unknown) {
  return {
    ...asRecord(current),
    ...asRecord(next),
  }
}

function humanizeDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) {
    return '0m 0s'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function normalizeMessageRole(role: unknown, direction: unknown): 'agent' | 'user' {
  const normalizedRole = asTrimmedString(role)?.toLowerCase()
  const normalizedDirection = asTrimmedString(direction)?.toLowerCase()

  if (
    normalizedRole === 'assistant' ||
    normalizedRole === 'agent' ||
    normalizedRole === 'bot' ||
    normalizedRole === 'ai' ||
    normalizedDirection === 'outgoing' ||
    normalizedDirection === 'assistant'
  ) {
    return 'agent'
  }

  return 'user'
}

// Lead storage disabled - only storing conversations
async function upsertLead() {
  return null
}

async function hasWebhookEvent(
  supabase: SupabaseClient,
  source: string,
  eventType: string,
  externalEventId?: string
) {
  if (!externalEventId) {
    return false
  }

  const { data } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('source', source)
    .eq('event_type', eventType)
    .eq('external_event_id', externalEventId)
    .maybeSingle<{ id: string }>()

  return Boolean(data)
}

async function recordWebhookEvent(
  supabase: SupabaseClient,
  input: {
    organizationId?: string
    source: string
    eventType: string
    externalEventId?: string
    payload: unknown
    processingStatus: 'processed' | 'failed'
    errorMessage?: string
  }
) {
  const { error } = await supabase.from('webhook_events').insert({
    organization_id: input.organizationId ?? null,
    source: input.source,
    event_type: input.eventType,
    external_event_id: input.externalEventId ?? null,
    processing_status: input.processingStatus,
    error_message: input.errorMessage ?? null,
    payload: input.payload && typeof input.payload === 'object' ? input.payload : { raw: input.payload },
    processed_at: new Date().toISOString(),
  })

  if (error && input.externalEventId) {
    return
  }

  if (error) {
    throw error
  }
}

async function upsertChatSession(
  supabase: SupabaseClient,
  organizationId: string,
  source: string,
  input: ChatbotIngestPayload,
  leadId: string | null
) {
  const sessionExternalId = asTrimmedString(input.session?.externalId) ?? asTrimmedString(input.sessionId)

  if (!sessionExternalId) {
    throw new Error('Chat ingest requires session.externalId or sessionId')
  }

  const { data: existing, error: existingError } = await supabase
    .from('chat_sessions')
    .select('id, started_at')
    .eq('organization_id', organizationId)
    .eq('source', source)
    .eq('source_session_id', sessionExternalId)
    .maybeSingle<ChatSessionRow>()

  if (existingError) {
    throw existingError
  }

  const payload = {
    organization_id: organizationId,
    lead_id: leadId,
    source,
    source_session_id: sessionExternalId,
    channel: asTrimmedString(input.session?.channel) ?? 'website',
    status: asTrimmedString(input.session?.status) ?? 'open',
    summary: asTrimmedString(input.session?.summary) ?? null,
    started_at: existing?.started_at ?? coerceTimestamp(input.session?.startedAt),
    last_message_at: coerceTimestamp(input.session?.lastMessageAt),
    metadata: asRecord(input.session?.metadata),
  }

  if (existing) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .single<{ id: string }>()

    if (error) {
      throw error
    }

    return data.id
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(payload)
    .select('id')
    .single<{ id: string }>()

  if (error) {
    throw error
  }

  return data.id
}

async function insertChatMessages(
  supabase: SupabaseClient,
  organizationId: string,
  source: string,
  sessionId: string,
  leadId: string | null,
  messages: ChatbotMessageInput[]
) {
  let insertedCount = 0
  let lastMessageAt = new Date().toISOString()

  for (const message of messages) {
    const content = asTrimmedString(message.content)
    if (!content) {
      continue
    }

    const sourceMessageId = asTrimmedString(message.externalId)
    if (sourceMessageId) {
      const { data: existing } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('session_id', sessionId)
        .eq('source_message_id', sourceMessageId)
        .maybeSingle<{ id: string }>()

      if (existing) {
        continue
      }
    }

    const sentAt = coerceTimestamp(message.sentAt)
    const { error } = await supabase.from('chat_messages').insert({
      organization_id: organizationId,
      session_id: sessionId,
      lead_id: leadId,
      source,
      source_message_id: sourceMessageId ?? null,
      role: normalizeMessageRole(message.role, message.direction),
      direction: asTrimmedString(message.direction) ?? 'incoming',
      content,
      metadata: asRecord(message.metadata),
      sent_at: sentAt,
    })

    if (error) {
      throw error
    }

    insertedCount += 1
    if (sentAt > lastMessageAt) {
      lastMessageAt = sentAt
    }
  }

  const { count, error: countError } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  if (countError) {
    throw countError
  }

  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .update({
      message_count: count ?? 0,
      last_message_at: lastMessageAt,
    })
    .eq('id', sessionId)

  if (sessionError) {
    throw sessionError
  }

  return {
    insertedCount,
    totalCount: count ?? 0,
  }
}

function maybeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function normalizeSeconds(value: unknown) {
  const numericValue = maybeNumber(value)
  if (numericValue === undefined) {
    return undefined
  }

  if (numericValue > 1000) {
    return numericValue / 1000
  }

  return numericValue
}

function extractRetellTurns(call: JsonRecord) {
  const rawTurns = Array.isArray(call.transcript_object)
    ? call.transcript_object
    : Array.isArray(call.transcript_with_tool_calls)
      ? call.transcript_with_tool_calls
      : []

  return rawTurns
    .map((item, index) => {
      if (!isRecord(item)) {
        return null
      }

      const text =
        asTrimmedString(item.content) ??
        asTrimmedString(item.transcript) ??
        asTrimmedString(item.message) ??
        asTrimmedString(item.text)

      if (!text) {
        return null
      }

      const rawRole =
        asTrimmedString(item.role) ??
        asTrimmedString(item.speaker) ??
        asTrimmedString(item.agent_type) ??
        'user'

      return {
        sequence_number: index,
        role: normalizeMessageRole(rawRole, rawRole),
        speaker: asTrimmedString(item.speaker) ?? rawRole,
        content: text,
        start_seconds:
          normalizeSeconds(item.start_seconds) ??
          normalizeSeconds(item.start_timestamp) ??
          normalizeSeconds(item.start_timestamp_ms),
        end_seconds:
          normalizeSeconds(item.end_seconds) ??
          normalizeSeconds(item.end_timestamp) ??
          normalizeSeconds(item.end_timestamp_ms),
        metadata: item,
      }
    })
    .filter((turn): turn is NonNullable<typeof turn> => Boolean(turn))
}

function extractRetellSummary(call: JsonRecord) {
  const analysis = asRecord(call.call_analysis)

  return (
    asTrimmedString(analysis.call_summary) ??
    asTrimmedString(analysis.summary) ??
    asTrimmedString(call.call_summary) ??
    asTrimmedString(call.summary) ??
    ''
  )
}

function extractRetellTranscriptText(call: JsonRecord, turns: ReturnType<typeof extractRetellTurns>) {
  const rawTranscript = asTrimmedString(call.transcript) ?? asTrimmedString(call.transcript_text)
  if (rawTranscript) {
    return rawTranscript
  }

  return turns.map((turn) => turn.content).join('\n')
}

export async function ingestChatbotPayload(payload: ChatbotIngestPayload) {
  const organizationId = asTrimmedString(payload.organizationId)
  if (!organizationId) {
    throw new Error('Chat ingest requires organizationId')
  }

  const source = asTrimmedString(payload.source) ?? 'n8n_chatbot'
  const supabase = getSupabaseAdmin()

  try {
    // Handle simple format from n8n
    let messages = payload.messages ?? []
    if (!messages.length && (payload.userMessage || payload.botResponse)) {
      if (payload.userMessage) {
        messages.push({
          role: 'user',
          direction: 'incoming',
          content: payload.userMessage,
        })
      }
      if (payload.botResponse) {
        let botContent = ''
        if (typeof payload.botResponse === 'string') {
          botContent = payload.botResponse
        } else if (typeof payload.botResponse === 'object' && payload.botResponse !== null) {
          botContent = payload.botResponse.message ?? ''
        }
        if (botContent) {
          messages.push({
            role: 'agent',
            direction: 'outgoing',
            content: botContent,
          })
        }
      }
    }

    // Get or create session
    const sessionExternalId = asTrimmedString(payload.session?.externalId) ?? asTrimmedString(payload.sessionId)
    if (!sessionExternalId) {
      throw new Error('Chat ingest requires sessionId')
    }

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('source', source)
      .eq('source_session_id', sessionExternalId)
      .maybeSingle()

    let sessionId: string

    if (existingSession) {
      sessionId = existingSession.id
    } else {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          organization_id: organizationId,
          source,
          source_session_id: sessionExternalId,
          channel: 'website',
          status: 'open',
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('Session insert error:', JSON.stringify(sessionError))
        throw new Error('Failed to create session: ' + sessionError.message + ' | details: ' + JSON.stringify(sessionError))
      }

      sessionId = newSession.id
    }

    // Insert messages
    if (messages.length > 0) {
      const messageRows = messages.map((msg) => ({
        organization_id: organizationId,
        session_id: sessionId,
        source,
        role: msg.role,
        direction: msg.direction,
        content: msg.content,
        sent_at: new Date().toISOString(),
      }))

      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert(messageRows)

      if (msgError) {
        console.error('Message insert error:', msgError)
        throw new Error('Failed to insert messages: ' + msgError.message)
      }
    }

    return { sessionId, messagesStored: messages.length }
  } catch (error) {
    console.error('Ingest error:', error)
    throw error
  }
}

export async function ingestRetellPayload(payload: unknown) {
  if (!isRecord(payload)) {
    throw new Error('Retell webhook payload must be an object')
  }

  const eventType =
    asTrimmedString(payload.event) ??
    asTrimmedString(payload.event_type) ??
    asTrimmedString(payload.type) ??
    'retell_webhook'
  const source = 'retell'
  const call = isRecord(payload.call) ? payload.call : payload
  const metadata = mergeMetadata(call.metadata, payload.metadata)
  let organizationId =
    asTrimmedString(metadata.organization_id) ??
    asTrimmedString(metadata.organizationId)

  console.log(`[retell/webhook] Processing event: ${eventType} for call: ${call.call_id || call.id}`)
  console.log(`[retell/webhook] Agent ID: ${call.agent_id || call.agentId}`)
  console.log(`[retell/webhook] Raw Metadata:`, JSON.stringify(metadata))

  if (!organizationId) {
    // Fallback mapping for specific known Agent IDs
    const agentId = asTrimmedString(call.agent_id) ?? asTrimmedString(call.agentId)
    console.log(`[retell/webhook] No organizationId in metadata. Checking Agent ID: ${agentId}`)
    
    // Mapping for BM Estate organization
    if (
      agentId === 'agent_ae930c223647893de0e20301f1' || // Outbound Agent
      agentId === 'agent_260c6da594883877249f642474'    // Inbound Agent
    ) {
      organizationId = '095aa09e-bf16-4958-be45-42c05762ed63'
      console.log(`[retell/webhook] Applied hardcoded mapping for BM Estate (095aa...63)`)
    } else {
      console.log(`[retell/webhook] WARNING: Unmapped Agent ID: ${agentId}. Call will be ignored.`)
    }
  }

  const retellCallId =
    asTrimmedString(call.call_id) ??
    asTrimmedString(call.callId) ??
    asTrimmedString(call.id)

  const supabase = getSupabaseAdmin()

  if (!retellCallId || !organizationId) {
    console.log(`[retell/webhook] REJECTED: Missing callId (${retellCallId}) or orgId (${organizationId})`)
    // Still store the event for debugging if mapping failed
    await supabase.from('webhook_events').insert({
      organization_id: organizationId || null,
      source,
      event_type: eventType,
      external_event_id: retellCallId || 'missing_id',
      payload,
    })
    return { duplicate: false, message: `Missing required IDs. Agent ID was: ${call.agent_id || call.agentId}` }
  }

  // Check if we've ALREADY fully processed this specific event to avoid double-processing
  if (await hasWebhookEvent(supabase, source, eventType, retellCallId)) {
    console.log(`[retell/webhook] Duplicate event ignored: ${eventType} for ${retellCallId}`)
    return { duplicate: true }
  }

  try {
    const leadId = null // Lead storage disabled

    const turns = extractRetellTurns(call)
    const transcriptText = extractRetellTranscriptText(call, turns)
    const durationFromMilliseconds = maybeNumber(call.call_duration_ms)
    const durationSeconds =
      maybeNumber(call.duration_seconds) ??
      maybeNumber(call.call_duration_seconds) ??
      (durationFromMilliseconds !== undefined ? Math.round(durationFromMilliseconds / 1000) : undefined)

    const callPayload = {
      organization_id: organizationId,
      lead_id: leadId,
      source,
      retell_call_id: retellCallId,
      retell_agent_id: asTrimmedString(call.agent_id) ?? asTrimmedString(call.agentId) ?? null,
      from_number: asTrimmedString(call.from_number) ?? null,
      to_number: asTrimmedString(call.to_number) ?? null,
      direction: asTrimmedString(call.direction) ?? null,
      status:
        asTrimmedString(call.call_status) ??
        asTrimmedString(call.status) ??
        (eventType === 'call_ended' || eventType === 'call_analyzed' ? 'completed' : 'in_progress'),
      duration_seconds: durationSeconds ?? null,
      duration_label: humanizeDuration(durationSeconds),
      summary: extractRetellSummary(call),
      transcript_text: transcriptText || null,
      recording_url:
        asTrimmedString(call.recording_url) ??
        asTrimmedString(call.recordingUrl) ??
        null,
      metadata: mergeMetadata(metadata, call),
      started_at: coerceTimestamp(
        call.start_timestamp ??
          call.start_timestamp_ms ??
          call.started_at ??
          call.created_at
      ),
      ended_at:
        eventType === 'call_ended' || eventType === 'call_analyzed'
          ? coerceTimestamp(call.end_timestamp ?? call.end_timestamp_ms ?? call.ended_at)
          : null,
    }

    const { data: existingCall, error: existingCallError } = await supabase
      .from('voice_calls')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('source', source)
      .eq('retell_call_id', retellCallId)
      .maybeSingle<VoiceCallRow>()

    if (existingCallError) {
      throw existingCallError
    }

    let callId: string

    if (existingCall) {
      const { data, error } = await supabase
        .from('voice_calls')
        .update(callPayload)
        .eq('id', existingCall.id)
        .select('id')
        .single<{ id: string }>()

      if (error) {
        throw error
      }

      callId = data.id
    } else {
      const { data, error } = await supabase
        .from('voice_calls')
        .insert(callPayload)
        .select('id')
        .single<{ id: string }>()

      if (error) {
        throw error
      }

      callId = data.id
    }

    for (const turn of turns) {
      const { error } = await supabase
        .from('voice_transcript_turns')
        .upsert(
          {
            organization_id: organizationId,
            call_id: callId,
            lead_id: leadId,
            source,
            ...turn,
          },
          { onConflict: 'call_id,sequence_number' }
        )

      if (error) {
        throw error
      }
    }

    await recordWebhookEvent(supabase, {
      organizationId,
      source,
      eventType,
      externalEventId: retellCallId,
      payload,
      processingStatus: 'processed',
    })

    return {
      duplicate: false,
      callId,
      leadId,
      transcriptTurns: turns.length,
    }
  } catch (error) {
    await recordWebhookEvent(getSupabaseAdmin(), {
      organizationId,
      source,
      eventType,
      externalEventId: retellCallId,
      payload,
      processingStatus: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown Retell ingest failure',
    })
    throw error
  }
}
