'use client'
import { motion } from 'framer-motion'
import { Achievement } from '@/types'

export function AchievementBadge({ achievement, index = 0 }: { achievement: Achievement; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      title={achievement.description ?? achievement.title}
      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-bg-elevated border border-border
        hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all duration-200 cursor-default"
    >
      <span className="text-2xl">{achievement.icon ?? '🏆'}</span>
      <span className="text-xs text-text-muted text-center leading-tight max-w-[72px] truncate">
        {achievement.title}
      </span>
    </motion.div>
  )
}
