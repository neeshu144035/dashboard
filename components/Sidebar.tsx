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
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-oyik-border flex flex-col h-screen overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-oyik-lavender overflow-hidden flex items-center justify-center p-1">
          <Image src="/oyik-logo.png" alt="Oyik AI" width={36} height={36} className="object-cover rounded-full" />
        </div>
        <span className="text-xl font-bold text-oyik-navy">Oyik AI</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'bg-oyik-lavender text-oyik-purple font-semibold border-l-2 border-oyik-purple rounded-lg mx-2'
                  : 'text-oyik-text hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-oyik-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-oyik-purple flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-oyik-navy truncate">{userName || 'User'}</p>
            <p className="text-xs text-oyik-muted truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
