'use client'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Workout } from '@/types'
import { formatDate } from '@/lib/utils'
import { Dumbbell } from 'lucide-react'
import Link from 'next/link'

const moodEmoji = ['', '😫', '😕', '😐', '😊', '🔥']

export function RecentWorkouts({ workouts }: { workouts: Workout[] }) {
  const recent = workouts.slice(0, 5)
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-brand-green" />
          <h2 className="font-bold text-text-primary">Recent Workouts</h2>
        </div>
        <Link href="/dashboard/workouts" className="text-xs text-brand-green hover:underline">View all</Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-text-muted text-sm">No workouts logged yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{w.exercise_name}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {formatDate(w.workout_date)}
                  {w.sets && w.reps && ` · ${w.sets}×${w.reps}`}
                  {w.weight_lbs && ` @ ${w.weight_lbs} lbs`}
                  {w.running_distance_miles && ` · ${w.running_distance_miles} mi`}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                {w.calories_burned && (
                  <p className="text-sm font-bold text-brand-green">{w.calories_burned} cal</p>
                )}
                {w.mood && <p className="text-lg">{moodEmoji[w.mood]}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
