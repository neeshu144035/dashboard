'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import DashboardView from '@/components/DashboardView'
import VoiceAgentView from '@/components/VoiceAgentView'
import ChatbotView from '@/components/ChatbotView'
import LoginPage from '@/components/LoginPage'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/supabase-data'
import { UserProfile } from '@/lib/types'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')

  useEffect(() => {
    let mounted = true

    async function syncUser(nextUser: User | null) {
      if (!mounted) {
        return
      }

      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const nextProfile = await getCurrentUserProfile(nextUser)

      if (!mounted) {
        return
      }

      setProfile(nextProfile)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncUser(data.session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (nextUser: User) => {
    setLoading(true)
    setUser(nextUser)
    setProfile(await getCurrentUserProfile(nextUser))
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-oyik-cream flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-oyik-border bg-white p-8 text-center shadow-[0_2px_8px_rgba(124,58,237,0.05)]">
          <h1 className="text-2xl font-bold text-oyik-navy">Profile setup pending</h1>
          <p className="mt-2 text-sm text-oyik-muted">
            Your account exists, but the organization profile is not ready yet. Try signing out and back in after
            applying the Supabase schema.
          </p>
        </div>
      </div>
    )
  }

  const getViewConfig = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', badge: 'Live', component: <DashboardView organizationId={profile.organizationId} /> }
      case 'voice':
        return { title: 'Voice Agent', badge: undefined, component: <VoiceAgentView organizationId={profile.organizationId} /> }
      case 'chatbot':
        return { title: 'Chatbot', badge: undefined, component: <ChatbotView organizationId={profile.organizationId} /> }
      default:
        return { title: 'Dashboard', badge: 'Live', component: <DashboardView organizationId={profile.organizationId} /> }
    }
  }

  const config = getViewConfig()

  return (
    <div className="flex h-screen bg-oyik-cream overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} userEmail={profile.email} userName={profile.fullName} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={config.title} badge={config.badge} onLogout={handleLogout} userEmail={profile.email} />
        <div className="flex-1 overflow-y-auto">{config.component}</div>
      </main>
    </div>
  )
}
