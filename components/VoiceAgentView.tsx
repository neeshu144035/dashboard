'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Phone } from 'lucide-react'
import StatCard from './StatCard'
import TranscriptPanel from './TranscriptPanel'
import { getCalls, getCallStats } from '@/lib/supabase-data'
import { Call, CallStats } from '@/lib/types'

interface VoiceAgentViewProps {
  organizationId: string
}

export default function VoiceAgentView({ organizationId }: VoiceAgentViewProps) {
  const [calls, setCalls] = useState<Call[]>([])
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [stats, setStats] = useState<CallStats>({ totalCalls: 0, avgDuration: '0m 0s', completedCalls: 0, successRate: '0%' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [callsData, statsData] = await Promise.all([getCalls(organizationId), getCallStats(organizationId)])
      setCalls(callsData)
      setStats(statsData)
      setSelectedCall(callsData[0] ?? null)
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
        <StatCard icon={Phone} label="Total Calls" value={stats.totalCalls} change="Retell calls stored for this organization" />
        <StatCard icon={Clock} label="Avg Duration" value={stats.avgDuration} change={`${stats.completedCalls} completed calls`} />
        <StatCard icon={CheckCircle} label="Success Rate" value={stats.successRate} change="Based on completed voice calls" />
      </div>

      {calls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-oyik-border p-8 text-center">
          <p className="text-oyik-muted">No voice calls have been stored yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="xl:w-[320px] bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-4 max-h-[620px] overflow-y-auto">
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
                  <p className="text-sm font-medium text-oyik-navy">{call.lead.name}</p>
                  <p className="text-xs text-oyik-muted mt-1">
                    {call.date} | {call.duration}
                  </p>
                  <p className="text-xs text-oyik-muted mt-1 truncate">{call.number}</p>
                  <span
                    className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      call.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : call.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {call.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {selectedCall ? (
              <>
                <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-oyik-navy">{selectedCall.lead.name}</h3>
                      <p className="text-sm text-oyik-muted">
                        {selectedCall.lead.phone || selectedCall.number} | Started {new Date(selectedCall.startedAt).toLocaleString('en-US')}
                      </p>
                      <p className="text-sm text-oyik-muted mt-1">
                        Retell call ID: {selectedCall.externalId}
                      </p>
                    </div>
                    <span className="rounded-full bg-oyik-lavender px-3 py-1 text-xs font-semibold text-oyik-purple">
                      {selectedCall.status}
                    </span>
                  </div>
                </div>

                <TranscriptPanel summary={selectedCall.summary} transcript={selectedCall.transcript} />
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
