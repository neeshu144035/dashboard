'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import DashboardView from '@/components/DashboardView'
import VoiceAgentView from '@/components/VoiceAgentView'
import ChatbotView from '@/components/ChatbotView'
import LoginPage from '@/components/LoginPage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (user: any) => {
    setUser(user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-oyik-cream flex items-center justify-center">
        <div className="text-oyik-purple">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''
  const organizationId = user?.user_metadata?.organization_id || user?.organization_id || user?.id

  const getViewConfig = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', badge: 'Live', component: <DashboardView userId={organizationId} /> }
      case 'voice':
        return { title: 'Voice Agent', badge: undefined, component: <VoiceAgentView userId={organizationId} /> }
      case 'chatbot':
        return { title: 'Chatbot', badge: undefined, component: <ChatbotView userId={organizationId} /> }
      default:
        return { title: 'Dashboard', badge: 'Live', component: <DashboardView userId={organizationId} /> }
    }
  }

  const config = getViewConfig()

  return (
    <div className="flex h-screen bg-oyik-cream overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} userEmail={userEmail} userName={userName} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={config.title} badge={config.badge} onLogout={handleLogout} userEmail={user.email} />
        <div className="flex-1 overflow-y-auto">
          {config.component}
        </div>
      </main>
    </div>
  )
}
