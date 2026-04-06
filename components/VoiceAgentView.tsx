'use client'

import { useState, useEffect } from 'react'
import { Phone, Clock, CheckCircle } from 'lucide-react'
import StatCard from './StatCard'
import TranscriptPanel from './TranscriptPanel'
import { getCalls, getCallStats } from '@/lib/supabase-data'
import { Call } from '@/lib/types'

interface VoiceAgentViewProps {
  userId: string
}

export default function VoiceAgentView({ userId }: VoiceAgentViewProps) {
  const [calls, setCalls] = useState<Call[]>([])
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [stats, setStats] = useState({ totalCalls: 0, avgDuration: '0m 0s', successRate: '0%' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [callsData, statsData] = await Promise.all([
        getCalls(userId),
        getCallStats(userId)
      ])
      setCalls(callsData)
      setStats(statsData)
      if (callsData.length > 0) {
        setSelectedCall(callsData[0])
      }
      setLoading(false)
    }
    loadData()
  }, [userId])

  if (loading) {
    return <div className="p-6 text-oyik-muted">Loading...</div>
  }

  if (calls.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Phone} label="Total Calls" value={0} change="+0%" />
          <StatCard icon={Clock} label="Avg Duration" value="0m 0s" change="+0s" />
          <StatCard icon={CheckCircle} label="Success Rate" value="0%" change="+0%" />
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-oyik-border p-8 text-center">
          <p className="text-oyik-muted">No voice calls yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Phone} label="Total Calls" value={stats.totalCalls} change="+8.1%" />
        <StatCard icon={Clock} label="Avg Duration" value={stats.avgDuration} change="-0.4s" />
        <StatCard icon={CheckCircle} label="Success Rate" value={stats.successRate} change="+2.1%" />
      </div>

      <div className="flex gap-4">
        <div className="w-[250px] bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-oyik-navy mb-4">Recent Calls</h3>
          <div className="space-y-2">
            {calls.map((call) => (
              <button
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCall?.id === call.id
                    ? 'bg-oyik-lavender border-l-2 border-oyik-purple'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-medium text-oyik-purple font-mono">{call.id}</p>
                <p className="text-xs text-oyik-muted mt-1">
                  {call.date} · {call.duration} · {call.number}
                </p>
                <span
                  className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    call.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {call.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {selectedCall && <TranscriptPanel summary={selectedCall.summary} transcript={selectedCall.transcript} />}
        </div>
      </div>
    </div>
  )
}
