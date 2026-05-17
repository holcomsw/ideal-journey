'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, BarChart2, Home, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'

interface NavbarProps {
  profile: Profile | null
  onSignOut: () => void
}

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/workouts', label: 'Workouts', icon: Activity },
  { href: '/dashboard/races', label: 'Races', icon: BarChart2 },
]

export function Navbar({ profile, onSignOut }: NavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-black text-sm">
            BH
          </div>
          <span className="font-bold text-text-primary hidden sm:block tracking-tight">
            Brady<span className="text-brand-blue">Runs</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-brand-blueDim text-brand-blue border border-brand-blue/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border">
            <User size={14} className="text-text-muted" />
            <span className="text-sm text-text-primary font-medium">
              {profile?.display_name ?? 'Athlete'}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/10 transition-all duration-200"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
