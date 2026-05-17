'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { AchievementToast } from '@/components/achievements/AchievementToast'
import { useAuth } from '@/hooks/useAuth'
import { useWorkouts } from '@/hooks/useWorkouts'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const { newAchievement } = useWorkouts(user?.id ?? null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar profile={profile} onSignOut={() => { signOut(); router.push('/login') }} />
      <AchievementToast achievement={newAchievement} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
