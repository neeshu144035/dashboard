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
    <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-oyik-lavender flex items-center justify-center">
          <Icon size={20} className="text-oyik-purple" />
        </div>
      </div>
      <p className="text-xs uppercase tracking-wide text-oyik-muted mb-1">{label}</p>
      <p className="text-3xl font-bold text-oyik-navy">{value}</p>
      {change ? <p className="text-sm text-oyik-purple font-medium mt-1">{change}</p> : null}
    </div>
  )
}
