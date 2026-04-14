'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: string
}

export default function StatCard({ icon: Icon, label, value, change }: StatCardProps) {
  return (
    <div className="bg-oyik-cream rounded-2xl shadow-nm-raised p-6 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl shadow-nm-inset flex items-center justify-center bg-oyik-cream">
          <Icon size={24} className="text-oyik-purple" />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-oyik-muted mb-1 opacity-70">{label}</p>
      <p className="text-4xl font-black text-oyik-navy tracking-tight">{value}</p>
      {change ? (
        <div className="mt-3 p-2 rounded-lg bg-white/30 backdrop-blur-sm text-[11px] text-oyik-purple font-semibold">
          {change}
        </div>
      ) : null}
    </div>
  )
}
