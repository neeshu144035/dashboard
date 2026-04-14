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
    <header className="h-20 bg-oyik-cream flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black text-oyik-navy tracking-tight">{title}</h1>
        {badge && (
          <span className="shadow-nm-raised-sm bg-oyik-cream text-oyik-purple text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-bold text-oyik-navy/60 uppercase tracking-tighter">{today}</span>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2 rounded-xl shadow-nm-raised bg-oyik-cream text-sm font-bold text-oyik-muted hover:text-red-500 hover:shadow-nm-inset transition-all duration-300"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  )
}
