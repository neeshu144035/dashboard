'use client'

import { LogOut } from 'lucide-react'

interface TopbarProps {
  title: string
  badge?: string
  onLogout?: () => void
  userEmail?: string
}

export default function Topbar({ title, badge, onLogout, userEmail }: TopbarProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="h-14 bg-white border-b border-oyik-border shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-oyik-navy">{title}</h1>
        {badge && (
          <span className="bg-oyik-purple text-white text-xs font-semibold px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-sm text-oyik-muted">{userEmail}</span>
        )}
        <span className="text-sm text-oyik-muted">{today}</span>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-oyik-muted hover:text-oyik-purple transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        )}
      </div>
    </header>
  )
}
