'use client'
import { useState } from 'react'
import { Plus, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { WorkoutTable } from '@/components/workouts/WorkoutTable'
import { WorkoutCharts } from '@/components/workouts/WorkoutCharts'
import { AchievementToast } from '@/components/achievements/AchievementToast'
import { useAuth } from '@/hooks/useAuth'
import { useWorkouts } from '@/hooks/useWorkouts'
import { Workout } from '@/types'

export default function WorkoutsPage() {
  const { user } = useAuth()
  const { workouts, newAchievement, addWorkout, updateWorkout, deleteWorkout } = useWorkouts(user?.id ?? null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Workout | undefined>()

  function openAdd() { setEditing(undefined); setFormOpen(true) }
  function openEdit(w: Workout) { setEditing(w); setFormOpen(true) }

  return (
    <div className="flex flex-col gap-6">
      <AchievementToast achievement={newAchievement} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-greenDim">
            <Activity size={20} className="text-brand-green" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">Workout Tracker</h1>
            <p className="text-text-muted text-sm">{workouts.length} sessions logged</p>
          </div>
        </div>
        <Button onClick={openAdd} variant="green">
          <Plus size={16} /> Log Workout
        </Button>
      </div>

      <WorkoutCharts workouts={workouts} />

      <div className="bg-bg-card border border-border rounded-xl p-6 bg-carbon">
        <h2 className="font-bold text-text-primary mb-4">Workout History</h2>
        <WorkoutTable
          workouts={workouts}
          onEdit={openEdit}
          onDelete={deleteWorkout}
        />
      </div>

      <WorkoutForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={editing
          ? (data) => updateWorkout(editing.id, data)
          : addWorkout
        }
        initial={editing}
      />
    </div>
  )
}
