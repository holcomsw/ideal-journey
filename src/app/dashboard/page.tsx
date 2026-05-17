'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRaces } from '@/hooks/useRaces'
import { useWorkouts } from '@/hooks/useWorkouts'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { StatGrid } from '@/components/dashboard/StatGrid'
import { AthleteCard } from '@/components/dashboard/AthleteCard'
import { RecentRaces } from '@/components/dashboard/RecentRaces'
import { RecentWorkouts } from '@/components/dashboard/RecentWorkouts'
import { PRSummary } from '@/components/dashboard/PRSummary'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import { Card } from '@/components/ui/Card'
import { Trophy } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, updateProfile } = useAuth()
  const { races, isPR } = useRaces(profile?.athlete_name ?? 'Brady Holcomb')
  const { workouts, achievements } = useWorkouts(user?.id ?? null)

  return (
    <div className="flex flex-col gap-6">
      <HeroSection profile={profile} />
      <StatGrid races={races} workouts={workouts} achievements={achievements} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AthleteCard profile={profile} onUpdate={updateProfile} />
          {achievements.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-yellow-400" />
                <h2 className="font-bold text-text-primary">Achievements</h2>
                <span className="ml-auto text-xs text-text-muted">{achievements.length}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {achievements.slice(0, 8).map((a, i) => (
                  <AchievementBadge key={a.id} achievement={a} index={i} />
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentRaces races={races} isPR={isPR} />
            <RecentWorkouts workouts={workouts} />
          </div>
          <PRSummary races={races} />
        </div>
      </div>
    </div>
  )
}
