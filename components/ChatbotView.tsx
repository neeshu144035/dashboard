'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, MessageSquare, ThumbsUp } from 'lucide-react'
import StatCard from './StatCard'
import ChatTranscriptPanel from './ChatTranscriptPanel'
import { getChats, getChatStats } from '@/lib/supabase-data'
import { Chat } from '@/lib/types'

interface ChatbotViewProps {
  userId: string
}

export default function ChatbotView({ userId }: ChatbotViewProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [stats, setStats] = useState({ totalChats: 0, avgMessages: '0', csat: '0' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [chatsData, statsData] = await Promise.all([
        getChats(userId),
        getChatStats(userId)
      ])
      setChats(chatsData)
      setStats(statsData)
      if (chatsData.length > 0) {
        setSelectedChat(chatsData[0])
      }
      setLoading(false)
    }
    loadData()
  }, [userId])

  if (loading) {
    return <div className="p-6 text-oyik-muted">Loading...</div>
  }

  if (chats.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={MessageCircle} label="Total Chats" value={0} change="+0%" />
          <StatCard icon={MessageSquare} label="Avg Messages" value="0" change="+0" />
          <StatCard icon={ThumbsUp} label="CSAT Score" value="0" change="+0" />
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-oyik-border p-8 text-center">
          <p className="text-oyik-muted">No chatbot sessions yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={MessageCircle} label="Total Chats" value={stats.totalChats} change="+12.4%" />
        <StatCard icon={MessageSquare} label="Avg Messages" value={stats.avgMessages} change="+0.8" />
        <StatCard icon={ThumbsUp} label="CSAT Score" value={stats.csat} change="+0.2" />
      </div>

      <div className="flex gap-4">
        <div className="w-[250px] bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-4 max-h-[500px] overflow-y-auto">
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
                <p className="text-sm font-medium text-oyik-purple font-mono">{chat.id}</p>
                <p className="text-xs text-oyik-muted mt-1">
                  {chat.date} · {chat.messages} messages
                </p>
                <span
                  className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    chat.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {chat.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {selectedChat && <ChatTranscriptPanel transcript={selectedChat.transcript} />}
        </div>
      </div>
    </div>
  )
}
