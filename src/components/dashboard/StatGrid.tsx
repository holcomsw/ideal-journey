'use client'
import { Activity, Award, Timer, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { RaceResult, Workout, Achievement } from '@/types'

interface StatGridProps {
  races: RaceResult[]
  workouts: Workout[]
  achievements: Achievement[]
}

export function StatGrid({ races, workouts, achievements }: StatGridProps) {
  // Best 400m time
  const best400 = races
    .filter(r => r.event?.includes('400') && r.result_seconds)
    .sort((a, b) => (a.result_seconds ?? 999) - (b.result_seconds ?? 999))[0]

  // Best 2-mile XC
  const best2mile = races
    .filter(r => r.sport === 'cross_country' && r.result?.includes(':') && r.result_seconds)
    .sort((a, b) => (a.result_seconds ?? 9999) - (b.result_seconds ?? 9999))[0]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Workouts"
        value={workouts.length}
        icon={Activity}
        color="blue"
        delay={0}
      />
      <StatCard
        label="Best 400m"
        value={best400?.result ?? '—'}
        icon={Timer}
        color="blue"
        delay={0.1}
        sub={best400?.meet_name ?? undefined}
      />
      <StatCard
        label="Best 2-Mile XC"
        value={best2mile?.result ?? '—'}
        icon={TrendingUp}
        color="green"
        delay={0.2}
        sub={best2mile?.meet_name ?? undefined}
      />
      <StatCard
        label="Achievements"
        value={achievements.length}
        icon={Award}
        color="green"
        delay={0.3}
      />
    </div>
  )
}
