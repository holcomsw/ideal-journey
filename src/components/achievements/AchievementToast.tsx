'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '@/types'

export function AchievementToast({ achievement }: { achievement: Achievement | null }) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3
            bg-bg-elevated border border-yellow-500/40 shadow-glow-green rounded-2xl px-6 py-4"
        >
          <span className="text-3xl">{achievement.icon ?? '🏆'}</span>
          <div>
            <p className="text-yellow-400 font-bold text-sm">Achievement Unlocked!</p>
            <p className="text-text-primary font-semibold">{achievement.title}</p>
            {achievement.description && (
              <p className="text-text-muted text-xs mt-0.5">{achievement.description}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
