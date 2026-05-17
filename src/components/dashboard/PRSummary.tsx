'use client'
import { Card } from '@/components/ui/Card'
import { PRBadge } from '@/components/ui/Badge'
import { RaceResult } from '@/types'
import { getSportLabel } from '@/lib/utils'
import { Trophy } from 'lucide-react'

export function PRSummary({ races }: { races: RaceResult[] }) {
  // One best result per event
  const prByEvent = races.reduce<Record<string, RaceResult>>((acc, r) => {
    if (!r.event || !r.result_seconds) return acc
    if (!acc[r.event] || r.result_seconds < acc[r.event].result_seconds!) acc[r.event] = r
    return acc
  }, {})

  const prs = Object.values(prByEvent).sort((a, b) =>
    (a.event ?? '').localeCompare(b.event ?? '')
  )

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-yellow-400" />
        <h2 className="font-bold text-text-primary">Personal Records</h2>
      </div>
      {prs.length === 0 ? (
        <p className="text-text-muted text-sm">No records yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prs.map(r => (
            <div key={r.event}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{r.event}</p>
                <p className="text-xs text-text-muted">{getSportLabel(r.sport)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-yellow-400">{r.result}</p>
                <PRBadge />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
