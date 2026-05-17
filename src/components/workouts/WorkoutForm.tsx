'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { WorkoutFormData, Workout } from '@/types'

const empty: WorkoutFormData = {
  exercise_name: '', workout_date: new Date().toISOString().split('T')[0],
  sets: '', reps: '', weight_lbs: '', running_distance_miles: '',
  running_time_seconds: '', calories_burned: '', notes: '', mood: 3, energy_level: 3,
}

interface WorkoutFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: WorkoutFormData) => Promise<unknown>
  initial?: Workout
}

export function WorkoutForm({ open, onClose, onSubmit, initial }: WorkoutFormProps) {
  const [form, setForm] = useState<WorkoutFormData>(initial ? {
    exercise_name: initial.exercise_name,
    workout_date: initial.workout_date,
    sets: initial.sets?.toString() ?? '',
    reps: initial.reps?.toString() ?? '',
    weight_lbs: initial.weight_lbs?.toString() ?? '',
    running_distance_miles: initial.running_distance_miles?.toString() ?? '',
    running_time_seconds: initial.running_time_seconds?.toString() ?? '',
    calories_burned: initial.calories_burned?.toString() ?? '',
    notes: initial.notes ?? '',
    mood: initial.mood ?? 3,
    energy_level: initial.energy_level ?? 3,
  } : empty)
  const [saving, setSaving] = useState(false)

  function set(k: keyof WorkoutFormData, v: string | number) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.exercise_name) return
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
    onClose()
    setForm(empty)
  }

  const inputCls = 'w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-blue/50 transition-colors'
  const labelCls = 'block text-xs text-text-muted mb-1 font-medium uppercase tracking-wider'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Workout' : 'Log Workout'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Exercise / Activity *</label>
            <input className={inputCls} placeholder="e.g. Back Squat, 400m Run" required
              value={form.exercise_name} onChange={e => set('exercise_name', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.workout_date}
              onChange={e => set('workout_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Calories Burned</label>
            <input type="number" className={inputCls} placeholder="0" value={form.calories_burned}
              onChange={e => set('calories_burned', e.target.value)} />
          </div>
        </div>

        {/* Strength */}
        <div>
          <p className="text-xs text-brand-blue font-semibold uppercase tracking-widest mb-2">Strength</p>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelCls}>Sets</label>
              <input type="number" className={inputCls} placeholder="0" value={form.sets}
                onChange={e => set('sets', e.target.value)} /></div>
            <div><label className={labelCls}>Reps</label>
              <input type="number" className={inputCls} placeholder="0" value={form.reps}
                onChange={e => set('reps', e.target.value)} /></div>
            <div><label className={labelCls}>Weight (lbs)</label>
              <input type="number" step="0.5" className={inputCls} placeholder="0" value={form.weight_lbs}
                onChange={e => set('weight_lbs', e.target.value)} /></div>
          </div>
        </div>

        {/* Running */}
        <div>
          <p className="text-xs text-brand-green font-semibold uppercase tracking-widest mb-2">Running</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Distance (miles)</label>
              <input type="number" step="0.01" className={inputCls} placeholder="0.00" value={form.running_distance_miles}
                onChange={e => set('running_distance_miles', e.target.value)} /></div>
            <div><label className={labelCls}>Time (seconds)</label>
              <input type="number" className={inputCls} placeholder="0" value={form.running_time_seconds}
                onChange={e => set('running_time_seconds', e.target.value)} /></div>
          </div>
        </div>

        {/* Mood & Energy */}
        <div className="grid grid-cols-2 gap-4">
          {(['mood', 'energy_level'] as const).map(key => (
            <div key={key}>
              <label className={labelCls}>{key === 'mood' ? 'Mood' : 'Energy'} ({form[key]}/5)</label>
              <input type="range" min={1} max={5} value={form[key]}
                onChange={e => set(key, parseInt(e.target.value))}
                className="w-full accent-brand-blue" />
            </div>
          ))}
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea className={inputCls + ' resize-none'} rows={2} placeholder="How did it go?"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Update' : 'Log Workout'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
