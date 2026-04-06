export type Role = 'agent' | 'user'
export type CallStatus = 'completed' | 'missed'
export type ChatStatus = 'resolved' | 'open'

export interface Message {
  role: Role
  text: string
}
export interface Call {
  id: string
  date: string
  duration: string
  number: string
  status: CallStatus
  summary: string
  transcript: Message[]
}
export interface Chat {
  id: string
  date: string
  messages: number
  status: ChatStatus
  summary: string
  transcript: Message[]
}
