'use client'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge, PRBadge } from '@/components/ui/Badge'
import { RaceResult } from '@/types'
import { formatDate, getSportLabel, getPlacementSuffix } from '@/lib/utils'

interface RaceTableProps {
  races: RaceResult[]
  isPR: (r: RaceResult) => boolean
  onEdit: (r: RaceResult) => void
  onDelete: (id: string) => void
}

export function RaceTable({ races, isPR, onEdit, onDelete }: RaceTableProps) {
  const [search, setSearch] = useState('')
  const [seasonFilter, setSeasonFilter] = useState('all')
  const [sportFilter, setSportFilter] = useState('all')

  const years = [...new Set(races.map(r => r.season_year).filter(Boolean))].sort((a, b) => b! - a!)

  const filtered = races.filter(r => {
    const matchSearch = !search ||
      r.event?.toLowerCase().includes(search.toLowerCase()) ||
      r.meet_name?.toLowerCase().includes(search.toLowerCase())
    const matchSeason = seasonFilter === 'all' || r.season_year?.toString() === seasonFilter
    const matchSport = sportFilter === 'all' || r.sport === sportFilter
    return matchSearch && matchSeason && matchSport
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-blue/50 flex-1 min-w-[160px]"
          placeholder="Search event or meet…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y!.toString()}>{y}</option>)}
        </select>
        <select className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          value={sportFilter} onChange={e => setSportFilter(e.target.value)}>
          <option value="all">All Sports</option>
          <option value="track">Track</option>
          <option value="cross_country">Cross Country</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted uppercase text-xs tracking-wider">
              <th className="text-left px-4 py-3">Event</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Meet</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3">Result</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Place</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted">No results found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-bg-elevated/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-text-primary">{r.event ?? '—'}</span>
                    <Badge variant={r.sport === 'cross_country' ? 'green' : 'blue'} className="hidden sm:inline-flex">
                      {getSportLabel(r.sport)}
                    </Badge>
                    {isPR(r) && <PRBadge />}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted hidden sm:table-cell max-w-[180px] truncate">
                  {r.meet_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-text-muted hidden md:table-cell">{formatDate(r.meet_date)}</td>
                <td className="px-4 py-3 font-bold text-text-primary">{r.result ?? '—'}</td>
                <td className="px-4 py-3 text-text-muted hidden sm:table-cell">{getPlacementSuffix(r.placement)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(r)}><Pencil size={13} /></Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(r.id)}><Trash2 size={13} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
