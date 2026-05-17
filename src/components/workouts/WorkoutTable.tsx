'use client'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Workout } from '@/types'
import { formatDate } from '@/lib/utils'

interface WorkoutTableProps {
  workouts: Workout[]
  onEdit: (w: Workout) => void
  onDelete: (id: string) => void
}

export function WorkoutTable({ workouts, onEdit, onDelete }: WorkoutTableProps) {
  const [search, setSearch] = useState('')
  const filtered = workouts.filter(w =>
    w.exercise_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <input
        className="w-full max-w-xs bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-blue/50"
        placeholder="Search workouts…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted uppercase text-xs tracking-wider">
              <th className="text-left px-4 py-3">Exercise</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Sets×Reps</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Weight</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Distance</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Calories</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-text-muted">No workouts found.</td></tr>
            ) : filtered.map(w => (
              <tr key={w.id} className="border-b border-border/50 hover:bg-bg-elevated/40 transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{w.exercise_name}</td>
                <td className="px-4 py-3 text-text-muted">{formatDate(w.workout_date)}</td>
                <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                  {w.sets && w.reps ? `${w.sets}×${w.reps}` : '—'}
                </td>
                <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                  {w.weight_lbs ? `${w.weight_lbs} lbs` : '—'}
                </td>
                <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                  {w.running_distance_miles ? `${w.running_distance_miles} mi` : '—'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {w.calories_burned ? (
                    <span className="text-brand-green font-semibold">{w.calories_burned}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(w)}><Pencil size={13} /></Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(w.id)}><Trash2 size={13} /></Button>
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
