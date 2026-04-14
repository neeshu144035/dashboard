'use client'

import { LayoutDashboard, Phone, MessageCircle, User } from 'lucide-react'
import Image from 'next/image'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  userEmail?: string
  userName?: string
}

export default function Sidebar({ activeView, onViewChange, userEmail, userName }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'voice', label: 'Voice Agent', icon: Phone },
    { id: 'chatbot', label: 'Chatbot', icon: MessageCircle },
  ]

  return (
    <aside className="w-[240px] min-w-[240px] bg-oyik-cream flex flex-col h-screen overflow-hidden p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-12 h-12 rounded-full shadow-nm-raised flex items-center justify-center bg-oyik-cream p-1">
          <Image src="/oyik-logo.png" alt="Oyik AI" width={40} height={40} className="object-cover rounded-full" />
        </div>
        <span className="text-xl font-black text-oyik-navy tracking-tight">Oyik AI</span>
      </div>

      <nav className="flex-1 space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-300 rounded-2xl ${
                isActive
                  ? 'shadow-nm-inset text-oyik-purple font-bold'
                  : 'text-oyik-muted hover:shadow-nm-raised-sm hover:text-oyik-navy hover:bg-white/10'
              }`}
            >
              <Icon size={22} className={isActive ? 'text-oyik-purple' : 'opacity-60'} />
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-4 p-4 rounded-3xl shadow-nm-raised bg-oyik-cream">
          <div className="w-10 h-10 rounded-full shadow-nm-inset flex items-center justify-center text-oyik-purple bg-oyik-cream">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-oyik-navy truncate leading-none mb-1">{userName || 'User'}</p>
            <p className="text-[10px] text-oyik-muted truncate font-bold uppercase tracking-wider">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
