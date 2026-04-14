import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import {
  Call,
  CallStats,
  Chat,
  ChatStats,
  DashboardSnapshot,
  Message,
  UserProfile,
} from './types'

type ProfileRow = {
  user_id: string
  organization_id: string | null
  full_name: string | null
  email: string | null
  organizations: { name: string | null } | { name: string | null }[] | null
}

type LeadRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
}

type ChatSessionRow = {
  id: string
  lead_id: string | null
  source_session_id: string
  status: string | null
  summary: string | null
  message_count: number | null
  started_at: string
  last_message_at: string
  channel: string | null
}

type ChatMessageRow = {
  id: string
  session_id: string
  role: string | null
  direction: string | null
  content: string | null
  sent_at: string
}

type VoiceCallRow = {
  id: string
  lead_id: string | null
  retell_call_id: string
  retell_agent_id: string | null
  from_number: string | null
  to_number: string | null
  direction: string | null
  status: string | null
  duration_seconds: number | null
  duration_label: string | null
  summary: string | null
  recording_url: string | null
  metadata: Record<string, any> | null
  started_at: string
}

type VoiceTranscriptRow = {
  id: string
  call_id: string
  role: string | null
  speaker: string | null
  content: string | null
  created_at: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDuration(seconds?: number | null, label?: string | null) {
  if (label) {
    return label
  }

  if (!seconds || seconds <= 0) {
    return '0m 0s'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function normalizeMessageRole(role: string | null, direction?: string | null): Message['role'] {
  const normalizedRole = role?.toLowerCase()
  const normalizedDirection = direction?.toLowerCase()

  if (
    normalizedRole === 'assistant' ||
    normalizedRole === 'agent' ||
    normalizedRole === 'bot' ||
    normalizedRole === 'ai' ||
    normalizedRole === 'transfer_target' ||
    normalizedDirection === 'outgoing' ||
    normalizedDirection === 'assistant'
  ) {
    return 'agent'
  }

  return 'user'
}

function getOrganizationName(organizations: ProfileRow['organizations']) {
  if (Array.isArray(organizations)) {
    return organizations[0]?.name ?? null
  }

  return organizations?.name ?? null
}

function createLeadLookup(leads: LeadRow[]) {
  return new Map(leads.map((lead) => [lead.id, lead]))
}

function createChatTranscriptLookup(messages: ChatMessageRow[]) {
  const lookup = new Map<string, Message[]>()

  for (const message of messages) {
    if (!message.content) {
      continue
    }

    const nextItem: Message = {
      id: message.id,
      role: normalizeMessageRole(message.role, message.direction),
      text: message.content,
      timestamp: message.sent_at,
    }
    const current = lookup.get(message.session_id) ?? []
    current.push(nextItem)
    lookup.set(message.session_id, current)
  }

  return lookup
}

function createCallTranscriptLookup(transcriptRows: VoiceTranscriptRow[]) {
  const lookup = new Map<string, Message[]>()

  for (const item of transcriptRows) {
    if (!item.content) {
      continue
    }

    const current = lookup.get(item.call_id) ?? []
    current.push({
      id: item.id,
      role: normalizeMessageRole(item.role),
      text: item.content,
      speaker: item.speaker,
      timestamp: item.created_at,
    })
    lookup.set(item.call_id, current)
  }

  return lookup
}

export async function getCurrentUserProfile(user: User): Promise<UserProfile> {
  const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const fallbackOrganizationId = user.user_metadata?.organization_id || user.id
  const fallbackOrganizationName = user.user_metadata?.organization_name || null

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, organization_id, full_name, email, organizations(name)')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>()

  if (error || !data?.organization_id) {
    return {
      userId: user.id,
      organizationId: fallbackOrganizationId,
      fullName: fallbackName,
      email: user.email || '',
      organizationName: fallbackOrganizationName,
    }
  }

  return {
    userId: data.user_id,
    organizationId: data.organization_id,
    fullName: data.full_name || fallbackName,
    email: data.email || user.email || '',
    organizationName: getOrganizationName(data.organizations),
  }
}

export async function getChats(organizationId: string, limit = 50): Promise<Chat[]> {
  const { data: sessions, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id, lead_id, source_session_id, status, summary, message_count, started_at, last_message_at, channel')
    .eq('organization_id', organizationId)
    .order('last_message_at', { ascending: false })
    .limit(limit)
    .returns<ChatSessionRow[]>()

  if (sessionError || !sessions) {
    console.error('Error fetching chat sessions:', sessionError?.message)
    return []
  }

  const leadIds = [...new Set(sessions.map((session) => session.lead_id).filter((value): value is string => Boolean(value)))]
  const sessionIds = sessions.map((session) => session.id)

  const [leadResponse, messageResponse] = await Promise.all([
    leadIds.length
      ? supabase.from('leads').select('id, full_name, email, phone').in('id', leadIds).returns<LeadRow[]>()
      : Promise.resolve({ data: [] as LeadRow[], error: null }),
    sessionIds.length
      ? supabase
          .from('chat_messages')
          .select('id, session_id, role, direction, content, sent_at')
          .eq('organization_id', organizationId)
          .in('session_id', sessionIds)
          .order('sent_at', { ascending: true })
          .returns<ChatMessageRow[]>()
      : Promise.resolve({ data: [] as ChatMessageRow[], error: null }),
  ])

  if (leadResponse.error) {
    console.error('Error fetching leads for chats:', leadResponse.error.message)
  }

  if (messageResponse.error) {
    console.error('Error fetching chat messages:', messageResponse.error.message)
  }

  const leadLookup = createLeadLookup(leadResponse.data ?? [])
  const transcriptLookup = createChatTranscriptLookup(messageResponse.data ?? [])

  return sessions.map((session) => {
    const lead = session.lead_id ? leadLookup.get(session.lead_id) : undefined

    return {
      id: session.id,
      externalId: session.source_session_id,
      date: formatDate(session.last_message_at),
      startedAt: session.started_at,
      lastMessageAt: session.last_message_at,
      messages: session.message_count ?? transcriptLookup.get(session.id)?.length ?? 0,
      status: session.status === 'closed' ? 'closed' : session.status === 'resolved' ? 'resolved' : 'open',
      summary: session.summary || 'Conversation stored in Supabase',
      transcript: transcriptLookup.get(session.id) ?? [],
      lead: {
        id: lead?.id ?? null,
        name: lead?.full_name || lead?.phone || 'Unknown lead',
        email: lead?.email ?? null,
        phone: lead?.phone ?? null,
      },
      channel: session.channel || 'website',
    }
  })
}

export async function getCalls(organizationId: string, limit = 50): Promise<Call[]> {
  const { data: calls, error: callError } = await supabase
    .from('voice_calls')
    .select(
      'id, lead_id, retell_call_id, retell_agent_id, from_number, to_number, direction, status, duration_seconds, duration_label, summary, recording_url, metadata, started_at'
    )
    .eq('organization_id', organizationId)
    .order('started_at', { ascending: false })
    .limit(limit)
    .returns<VoiceCallRow[]>()

  if (callError || !calls) {
    console.error('Error fetching voice calls:', callError?.message)
    return []
  }

  const leadIds = [...new Set(calls.map((call) => call.lead_id).filter((value): value is string => Boolean(value)))]
  const callIds = calls.map((call) => call.id)

  const [leadResponse, transcriptResponse] = await Promise.all([
    leadIds.length
      ? supabase.from('leads').select('id, full_name, email, phone').in('id', leadIds).returns<LeadRow[]>()
      : Promise.resolve({ data: [] as LeadRow[], error: null }),
    callIds.length
      ? supabase
          .from('voice_transcript_turns')
          .select('id, call_id, role, speaker, content, created_at')
          .eq('organization_id', organizationId)
          .in('call_id', callIds)
          .order('created_at', { ascending: true })
          .returns<VoiceTranscriptRow[]>()
      : Promise.resolve({ data: [] as VoiceTranscriptRow[], error: null }),
  ])

  if (leadResponse.error) {
    console.error('Error fetching leads for calls:', leadResponse.error.message)
  }

  if (transcriptResponse.error) {
    console.error('Error fetching voice transcripts:', transcriptResponse.error.message)
  }

  const leadLookup = createLeadLookup(leadResponse.data ?? [])
  const transcriptLookup = createCallTranscriptLookup(transcriptResponse.data ?? [])

  return calls.map((call) => {
    const lead = call.lead_id ? leadLookup.get(call.lead_id) : undefined
    const status = call.status?.toLowerCase() ?? 'in_progress'
    const direction = call.direction?.toLowerCase() === 'outbound' ? 'outbound' : 'inbound'
    const displayNumber = direction === 'outbound' ? call.to_number : call.from_number
    
    // Extract metadata values if they exist
    const userSentiment = call.metadata?.call_analysis?.user_sentiment
      ?? call.metadata?.user_sentiment
      ?? null
    const callSuccessful = call.metadata?.call_analysis?.call_successful
      ?? call.metadata?.call_successful
      ?? null

    return {
      id: call.id,
      externalId: call.retell_call_id,
      date: formatDate(call.started_at),
      startedAt: call.started_at,
      duration: formatDuration(call.duration_seconds, call.duration_label),
      number: displayNumber || call.from_number || call.to_number || 'Unknown number',
      direction,
      status: status === 'completed' ? 'completed' : status === 'in_progress' ? 'in_progress' : 'missed',
      summary: call.summary || 'Awaiting post-call analysis',
      userSentiment,
      callSuccessful,
      transcript: transcriptLookup.get(call.id) ?? [],
      lead: {
        id: lead?.id ?? null,
        name: lead?.full_name || displayNumber || 'Unknown caller',
        email: lead?.email ?? null,
        phone: lead?.phone ?? displayNumber ?? null,
      },
      agentId: call.retell_agent_id,
      recordingUrl: call.recording_url,
    }
  })
}

export async function getChatStats(organizationId: string): Promise<ChatStats> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, message_count, status')
    .eq('organization_id', organizationId)
    .returns<Array<{ id: string; message_count: number | null; status: string | null }>>()

  if (error || !data) {
    console.error('Error fetching chat stats:', error?.message)
    return { totalChats: 0, totalMessages: 0, avgMessages: '0', openChats: 0 }
  }

  const totalChats = data.length
  const totalMessages = data.reduce((sum, row) => sum + (row.message_count ?? 0), 0)
  const openChats = data.filter((row) => (row.status ?? 'open') === 'open').length

  return {
    totalChats,
    totalMessages,
    avgMessages: totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : '0',
    openChats,
  }
}

export async function getCallStats(organizationId: string): Promise<CallStats> {
  const { data, error } = await supabase
    .from('voice_calls')
    .select('id, status, duration_seconds')
    .eq('organization_id', organizationId)
    .returns<Array<{ id: string; status: string | null; duration_seconds: number | null }>>()

  if (error || !data) {
    console.error('Error fetching call stats:', error?.message)
    return { totalCalls: 0, avgDuration: '0m 0s', completedCalls: 0, successRate: '0%' }
  }

  const totalCalls = data.length
  const completedCalls = data.filter((call) => (call.status ?? '').toLowerCase() === 'completed').length
  const totalDuration = data.reduce((sum, call) => sum + (call.duration_seconds ?? 0), 0)
  const averageDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0

  return {
    totalCalls,
    avgDuration: formatDuration(averageDuration),
    completedCalls,
    successRate: totalCalls > 0 ? `${Math.round((completedCalls / totalCalls) * 100)}%` : '0%',
  }
}

export async function getDashboardSnapshot(organizationId: string): Promise<DashboardSnapshot> {
  const [{ count: leadCount }, chatStats, callStats, recentChats, recentCalls] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    getChatStats(organizationId),
    getCallStats(organizationId),
    getChats(organizationId, 5),
    getCalls(organizationId, 5),
  ])

  return {
    totalLeads: leadCount ?? 0,
    totalChats: chatStats.totalChats,
    totalMessages: chatStats.totalMessages,
    totalCalls: callStats.totalCalls,
    recentChats,
    recentCalls,
  }
}
