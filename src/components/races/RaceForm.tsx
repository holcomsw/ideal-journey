'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { RaceFormData, RaceResult } from '@/types'

const empty: RaceFormData = {
  sport: 'track', event: '', meet_name: '', meet_date: '',
  result: '', placement: '', grade: '', season_year: new Date().getFullYear().toString(),
}

interface RaceFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RaceFormData) => Promise<unknown>
  initial?: RaceResult
}

export function RaceForm({ open, onClose, onSubmit, initial }: RaceFormProps) {
  const [form, setForm] = useState<RaceFormData>(initial ? {
    sport: initial.sport,
    event: initial.event ?? '',
    meet_name: initial.meet_name ?? '',
    meet_date: initial.meet_date ?? '',
    result: initial.result ?? '',
    placement: initial.placement?.toString() ?? '',
    grade: initial.grade ?? '',
    season_year: initial.season_year?.toString() ?? '',
  } : empty)
  const [saving, setSaving] = useState(false)

  function set(k: keyof RaceFormData, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
    onClose()
    setForm(empty)
  }

  const inputCls = 'w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-blue/50 transition-colors'
  const labelCls = 'block text-xs text-text-muted mb-1 font-medium uppercase tracking-wider'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Race Result' : 'Add Race Result'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Sport *</label>
            <select className={inputCls} value={form.sport} onChange={e => set('sport', e.target.value)}>
              <option value="track">Track</option>
              <option value="cross_country">Cross Country</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Event</label>
            <input className={inputCls} placeholder="e.g. 400 Meters" value={form.event}
              onChange={e => set('event', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Meet Name</label>
            <input className={inputCls} placeholder="e.g. 2025 IESA Sectional" value={form.meet_name}
              onChange={e => set('meet_name', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.meet_date}
              onChange={e => set('meet_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Result / Time</label>
            <input className={inputCls} placeholder="e.g. 1:11.34 or 14:22.5" value={form.result}
              onChange={e => set('result', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Place</label>
            <input type="number" className={inputCls} placeholder="e.g. 9" value={form.placement}
              onChange={e => set('placement', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Grade</label>
            <input className={inputCls} placeholder="e.g. 8th" value={form.grade}
              onChange={e => set('grade', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Season Year</label>
            <input type="number" className={inputCls} placeholder="2026" value={form.season_year}
              onChange={e => set('season_year', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Update' : 'Add Race'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
