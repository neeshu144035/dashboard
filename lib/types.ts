export type Role = 'agent' | 'user'
export type CallStatus = 'completed' | 'missed' | 'in_progress'
export type ChatStatus = 'open' | 'resolved' | 'closed'

export interface Message {
  id?: string
  role: Role
  text: string
  speaker?: string | null
  timestamp?: string
}

export interface UserProfile {
  userId: string
  organizationId: string
  fullName: string
  email: string
  organizationName?: string | null
}

export interface LeadSummary {
  id?: string | null
  name: string
  email?: string | null
  phone?: string | null
}

export interface Call {
  id: string
  externalId: string
  date: string
  startedAt: string
  duration: string
  number: string
  status: CallStatus
  summary: string
  transcript: Message[]
  lead: LeadSummary
  agentId?: string | null
  recordingUrl?: string | null
}

export interface Chat {
  id: string
  externalId: string
  date: string
  startedAt: string
  lastMessageAt: string
  messages: number
  status: ChatStatus
  summary: string
  transcript: Message[]
  lead: LeadSummary
  channel: string
}

export interface ChatStats {
  totalChats: number
  totalMessages: number
  avgMessages: string
  openChats: number
}

export interface CallStats {
  totalCalls: number
  avgDuration: string
  completedCalls: number
  successRate: string
}

export interface DashboardSnapshot {
  totalLeads: number
  totalChats: number
  totalMessages: number
  totalCalls: number
  recentChats: Chat[]
  recentCalls: Call[]
}
