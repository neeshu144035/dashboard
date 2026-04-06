'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Phone, TrendingUp } from 'lucide-react'
import StatCard from './StatCard'
import LineChartComponent from './LineChart'
import DonutChart from './DonutChart'
import BarChartComponent from './BarChart'
import { getChatStats, getCallStats } from '@/lib/supabase-data'

interface DashboardViewProps {
  userId: string
}

export default function DashboardView({ userId }: DashboardViewProps) {
  const [chatStats, setChatStats] = useState({ totalChats: 0, avgMessages: '0', csat: '0' })
  const [callStats, setCallStats] = useState({ totalCalls: 0, avgDuration: '0m 0s', successRate: '0%' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [chat, call] = await Promise.all([
        getChatStats(userId),
        getCallStats(userId)
      ])
      setChatStats(chat)
      setCallStats(call)
      setLoading(false)
    }
    loadStats()
  }, [userId])

  const totalMessages = chatStats.totalChats * parseFloat(chatStats.avgMessages || '0')
  const totalInteractions = chatStats.totalChats + callStats.totalCalls

  const lineChartData = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    messagesData: [2100, 2400, 2800, 3100, 3500, 4200, totalMessages || 4821],
    callsData: [800, 850, 920, 980, 1050, 1180, callStats.totalCalls || 1293],
  }

  const donutChartData = {
    labels: ['Chatbot', 'Voice', 'Email'],
    values: [58, 31, 11],
  }

  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [92, 88, 95, 87, 91, 78, 65],
  }

  if (loading) {
    return <div className="p-6 text-oyik-muted">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={MessageCircle} label="Messages" value={totalMessages || 4821} change="+12.4%" />
        <StatCard icon={Phone} label="Calls" value={callStats.totalCalls || 1293} change="+8.1%" />
        <StatCard icon={TrendingUp} label="Conversion" value="34.7%" change="+2.3%" />
      </div>

      <LineChartComponent data={lineChartData} />

      <div className="grid grid-cols-2 gap-4">
        <DonutChart data={donutChartData} />
        <BarChartComponent data={barChartData} />
      </div>
    </div>
  )
}
