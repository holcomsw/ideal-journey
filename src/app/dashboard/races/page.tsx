'use client'
import { useState } from 'react'
import { Plus, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RaceForm } from '@/components/races/RaceForm'
import { RaceTable } from '@/components/races/RaceTable'
import { RaceCharts } from '@/components/races/RaceCharts'
import { useAuth } from '@/hooks/useAuth'
import { useRaces } from '@/hooks/useRaces'
import { RaceResult } from '@/types'

export default function RacesPage() {
  const { profile } = useAuth()
  const { races, loading, isPR, addRace, updateRace, deleteRace } = useRaces(
    profile?.athlete_name ?? 'Brady Holcomb'
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RaceResult | undefined>()

  function openAdd() { setEditing(undefined); setFormOpen(true) }
  function openEdit(r: RaceResult) { setEditing(r); setFormOpen(true) }

  // Summary stats
  const xcRaces = races.filter(r => r.sport === 'cross_country')
  const trackRaces = races.filter(r => r.sport === 'track')
  const prCount = races.filter(r => isPR(r)).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-blueDim">
            <BarChart2 size={20} className="text-brand-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">Race Results</h1>
            <p className="text-text-muted text-sm">
              {races.length} races · {xcRaces.length} XC · {trackRaces.length} Track · {prCount} PRs
            </p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Race
        </Button>
      </div>

      <RaceCharts races={races} />

      <div className="bg-bg-card border border-border rounded-xl p-6 bg-carbon">
        <h2 className="font-bold text-text-primary mb-4">All Results</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <RaceTable
            races={races}
            isPR={isPR}
            onEdit={openEdit}
            onDelete={deleteRace}
          />
        )}
      </div>

      <RaceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={editing
          ? (data) => updateRace(editing.id, data)
          : addRace
        }
        initial={editing}
      />
    </div>
  )
}
