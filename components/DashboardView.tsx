'use client'

import { useEffect, useState } from 'react'
import { FileText, MessageCircle, Phone, UserRound } from 'lucide-react'
import StatCard from './StatCard'
import { getDashboardSnapshot } from '@/lib/supabase-data'
import { DashboardSnapshot } from '@/lib/types'

interface DashboardViewProps {
  organizationId: string
}

export default function DashboardView({ organizationId }: DashboardViewProps) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSnapshot() {
      setLoading(true)
      const data = await getDashboardSnapshot(organizationId)
      setSnapshot(data)
      setLoading(false)
    }

    void loadSnapshot()
  }, [organizationId])

  if (loading) {
    return <div className="p-6 text-oyik-muted">Loading...</div>
  }

  const recentChats = snapshot?.recentChats ?? []
  const recentCalls = snapshot?.recentCalls ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserRound} label="Total Leads" value={snapshot?.totalLeads ?? 0} change="Captured from chatbot and Retell flows" />
        <StatCard icon={MessageCircle} label="Chat Sessions" value={snapshot?.totalChats ?? 0} change="One row per website conversation" />
        <StatCard icon={FileText} label="Messages Stored" value={snapshot?.totalMessages ?? 0} change="Inbound and outbound chat turns" />
        <StatCard icon={Phone} label="Voice Calls" value={snapshot?.totalCalls ?? 0} change="Retell calls linked to this organization" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="bg-oyik-cream rounded-2xl shadow-nm-raised p-6">
          <h2 className="text-sm font-semibold text-oyik-navy mb-4">Latest Chats</h2>
          {recentChats.length === 0 ? (
            <p className="text-sm text-oyik-muted">No chatbot sessions have been stored yet.</p>
          ) : (
            <div className="space-y-4">
              {recentChats.map((chat) => (
                <div key={chat.id} className="rounded-2xl shadow-nm-inset bg-oyik-cream p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-oyik-navy">{chat.lead.name}</p>
                      <p className="text-xs text-oyik-muted mt-1 uppercase tracking-wider font-semibold">
                        {chat.channel} | {chat.messages} msgs | {chat.date}
                      </p>
                    </div>
                    <span className="rounded-full shadow-nm-raised-sm bg-oyik-cream px-3 py-1 text-[10px] font-black uppercase tracking-widest text-oyik-purple">
                      {chat.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-oyik-text font-medium">{chat.summary}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-oyik-cream rounded-2xl shadow-nm-raised p-6">
          <h2 className="text-sm font-semibold text-oyik-navy mb-4">Latest Calls</h2>
          {recentCalls.length === 0 ? (
            <p className="text-sm text-oyik-muted">No voice calls have been stored yet.</p>
          ) : (
            <div className="space-y-4">
              {recentCalls.map((call) => (
                <div key={call.id} className="rounded-2xl shadow-nm-inset bg-oyik-cream p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-oyik-navy">{call.lead.name}</p>
                      <p className="text-xs text-oyik-muted mt-1 uppercase tracking-wider font-semibold">
                        {call.duration} | {call.number} | {call.date}
                      </p>
                    </div>
                    <span className="rounded-full shadow-nm-raised-sm bg-oyik-cream px-3 py-1 text-[10px] font-black uppercase tracking-widest text-oyik-purple">
                      {call.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-oyik-text font-medium">{call.summary}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
