'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, MessageSquare, TimerReset } from 'lucide-react'
import StatCard from './StatCard'
import ChatTranscriptPanel from './ChatTranscriptPanel'
import { getChats, getChatStats } from '@/lib/supabase-data'
import { Chat, ChatStats } from '@/lib/types'

interface ChatbotViewProps {
  organizationId: string
}

export default function ChatbotView({ organizationId }: ChatbotViewProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [stats, setStats] = useState<ChatStats>({ totalChats: 0, totalMessages: 0, avgMessages: '0', openChats: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [chatsData, statsData] = await Promise.all([getChats(organizationId), getChatStats(organizationId)])
      setChats(chatsData)
      setStats(statsData)
      setSelectedChat(chatsData[0] ?? null)
      setLoading(false)
    }

    void loadData()
  }, [organizationId])

  if (loading) {
    return <div className="p-6 text-oyik-muted">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={MessageCircle} label="Total Chats" value={stats.totalChats} change="Stored from the organization chatbot workflow" />
        <StatCard icon={MessageSquare} label="Messages Stored" value={stats.totalMessages} change={`Average ${stats.avgMessages} messages per chat`} />
        <StatCard icon={TimerReset} label="Open Sessions" value={stats.openChats} change="Still active or awaiting follow-up" />
      </div>

      {chats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-oyik-border p-8 text-center">
          <p className="text-oyik-muted">No chatbot sessions have been stored yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="xl:w-[320px] bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-4 max-h-[620px] overflow-y-auto">
            <h3 className="text-sm font-semibold text-oyik-navy mb-4">Recent Chats</h3>
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'bg-oyik-lavender border-l-2 border-oyik-purple'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium text-oyik-navy">{chat.lead.name}</p>
                  <p className="text-xs text-oyik-muted mt-1">
                    {chat.date} | {chat.messages} messages
                  </p>
                  <p className="text-xs text-oyik-muted mt-1 truncate">{chat.externalId}</p>
                  <span
                    className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      chat.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : chat.status === 'closed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {chat.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {selectedChat ? (
              <>
                <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-oyik-navy">{selectedChat.lead.name}</h3>
                      <p className="text-sm text-oyik-muted">
                        {selectedChat.lead.email || 'No email'} | {selectedChat.lead.phone || 'No phone'}
                      </p>
                      <p className="text-sm text-oyik-muted mt-1">
                        {selectedChat.channel} | Started {new Date(selectedChat.startedAt).toLocaleString('en-US')}
                      </p>
                    </div>
                    <span className="rounded-full bg-oyik-lavender px-3 py-1 text-xs font-semibold text-oyik-purple">
                      {selectedChat.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-oyik-text">{selectedChat.summary}</p>
                </div>

                <ChatTranscriptPanel transcript={selectedChat.transcript} />
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
