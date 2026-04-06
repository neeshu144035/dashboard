import { createClient } from '@supabase/supabase-js'
import { Chat, Call } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getChats(organizationId: string): Promise<Chat[]> {
  console.log('getChats - organizationId:', organizationId)
  
  const { data, error } = await supabase
    .from('chatbot_sessions')
    .select('*')
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error fetching chats:', error.message, error.code)
    return []
  }

  console.log('Filtered Chats data for user:', data)
  
  const parseTranscript = (transcript: any) => {
    if (Array.isArray(transcript)) return transcript
    if (typeof transcript === 'string') {
      if (transcript.startsWith('[')) {
        try {
          return JSON.parse(transcript)
        } catch {
          return [{ role: 'agent', text: transcript }]
        }
      }
      return [{ role: 'agent', text: transcript }]
    }
    return []
  }

  return data.map((row: any) => ({
    id: row.session_id,
    date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    messages: parseTranscript(row.transcript).length || 0,
    status: row.conversion ? 'resolved' : 'open',
    summary: row.conversion ? 'Conversion successful' : 'Pending',
    transcript: parseTranscript(row.transcript)
  }))
}

export async function getCalls(organizationId: string): Promise<Call[]> {
  console.log('getCalls - organizationId:', organizationId)
  
  const { data, error } = await supabase
    .from('voice_agent_calls')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching calls:', error.message, error.code)
    return []
  }

  console.log('Calls data:', data)
  
  const parseTranscript = (transcript: any) => {
    if (Array.isArray(transcript)) return transcript
    if (typeof transcript === 'string') {
      if (transcript.startsWith('[')) {
        try {
          return JSON.parse(transcript)
        } catch {
          return [{ role: 'agent', text: transcript }]
        }
      }
      return [{ role: 'agent', text: transcript }]
    }
    return []
  }

  return data.map((row: any) => ({
    id: row.call_id,
    date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    duration: row.duration || '0m 0s',
    number: row.number || 'Unknown',
    status: row.status || (row.summary ? 'completed' : 'missed'),
    summary: row.summary || '',
    transcript: parseTranscript(row.transcript)
  }))
}

export async function getChatStats(organizationId: string): Promise<{ totalChats: number; avgMessages: string; csat: string }> {
  console.log('getChatStats - organizationId:', organizationId)

  const { data, error } = await supabase
    .from('chatbot_sessions')
    .select('*')
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error fetching chat stats:', error.message, error.code)
    return { totalChats: 0, avgMessages: '0', csat: '0' }
  }

  console.log('Chat stats raw data:', data)

  const totalChats = data?.length || 0
  
  // Calculate messages from transcript length
  const parseTranscript = (transcript: any) => {
    if (Array.isArray(transcript)) return transcript
    if (typeof transcript === 'string') {
      try {
        return JSON.parse(transcript)
      } catch {
        return []
      }
    }
    return []
  }
  
  const totalMessages = data?.reduce((sum: number, row: any) => {
    return sum + parseTranscript(row.transcript).length
  }, 0) || 0
  
  const avgMessages = totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : '0'

  return {
    totalChats,
    avgMessages,
    csat: '4.7'
  }
}

export async function getCallStats(organizationId: string): Promise<{ totalCalls: number; avgDuration: string; successRate: string }> {
  console.log('getCallStats - organizationId:', organizationId)

  const { data, error } = await supabase
    .from('voice_agent_calls')
    .select('*')
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error fetching call stats:', error.message, error.code)
    return { totalCalls: 0, avgDuration: '0m 0s', successRate: '0%' }
  }

  console.log('Call stats raw data:', data)

  const totalCalls = data?.length || 0
  const completedCalls = data?.filter((row: any) => row.summary !== null && row.summary !== '').length || 0
  const successRate = totalCalls > 0 
    ? ((completedCalls / totalCalls) * 100).toFixed(1)
    : '0'

  return {
    totalCalls,
    avgDuration: '3m 12s',
    successRate: `${successRate}%`
  }
}
