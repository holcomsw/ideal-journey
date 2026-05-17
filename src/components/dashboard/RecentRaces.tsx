'use client'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { PRBadge, Badge } from '@/components/ui/Badge'
import { RaceResult } from '@/types'
import { formatDate, getSportLabel, getPlacementSuffix } from '@/lib/utils'
import { Flag } from 'lucide-react'
import Link from 'next/link'

interface RecentRacesProps {
  races: RaceResult[]
  isPR: (r: RaceResult) => boolean
}

export function RecentRaces({ races, isPR }: RecentRacesProps) {
  const recent = races.slice(0, 5)
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-brand-blue" />
          <h2 className="font-bold text-text-primary">Recent Races</h2>
        </div>
        <Link href="/dashboard/races" className="text-xs text-brand-blue hover:underline">View all</Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-text-muted text-sm">No races yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {r.event ?? getSportLabel(r.sport)}
                  </span>
                  {isPR(r) && <PRBadge />}
                  <Badge variant={r.sport === 'cross_country' ? 'green' : 'blue'}>
                    {getSportLabel(r.sport)}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {r.meet_name ?? '—'} · {formatDate(r.meet_date)}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-bold text-text-primary">{r.result ?? '—'}</p>
                <p className="text-xs text-text-muted">{getPlacementSuffix(r.placement)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
