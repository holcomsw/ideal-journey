'use client'
import { motion } from 'framer-motion'
import { Profile } from '@/types'
import { Zap } from 'lucide-react'

export function HeroSection({ profile }: { profile: Profile | null }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = profile?.display_name ?? 'Athlete'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-bg-card p-8 bg-carbon">
      {/* Animated background glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-brand-green/8 rounded-full blur-3xl pointer-events-none" />

      {/* Lightning accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/60 to-transparent" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-text-muted text-sm font-medium mb-1">{greeting}, {name} 👋</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            <span className="text-text-primary">Train Strong. </span>
            <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
              Race Faster.
            </span>
          </h1>
          <p className="text-text-muted max-w-md">
            Built for elite performance. Track every rep, every race, every record.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center gap-2"
        >
          <Zap size={14} className="text-brand-blue" />
          <span className="text-xs text-text-muted font-medium uppercase tracking-widest">
            Performance Dashboard
          </span>
        </motion.div>
      </div>
    </div>
  )
}
