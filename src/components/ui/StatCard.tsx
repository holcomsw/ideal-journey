'use client'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'green'
  delay?: number
  sub?: string
}

export function StatCard({ label, value, icon: Icon, color = 'blue', delay = 0, sub }: StatCardProps) {
  const isBlue = color === 'blue'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border bg-bg-card bg-carbon p-5 flex items-start gap-4 group hover:scale-[1.02] transition-transform duration-200',
        isBlue ? 'border-brand-blue/20 hover:shadow-glow-blue' : 'border-brand-green/20 hover:shadow-glow-green'
      )}
    >
      <div className={cn(
        'p-3 rounded-lg',
        isBlue ? 'bg-brand-blueDim text-brand-blue' : 'bg-brand-greenDim text-brand-green'
      )}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-text-muted text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
        <p className={cn(
          'text-2xl font-bold',
          isBlue ? 'text-brand-blue' : 'text-brand-green'
        )}>{value}</p>
        {sub && <p className="text-text-muted text-xs mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}
