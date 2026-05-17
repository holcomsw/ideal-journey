'use client'
import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { Card } from '@/components/ui/Card'
import { RaceResult } from '@/types'
import { formatDate } from '@/lib/utils'

const tooltipStyle = {
  backgroundColor: '#0d1117', border: '1px solid #1e2433',
  borderRadius: 8, color: '#e2e8f0', fontSize: 12,
}

export function RaceCharts({ races }: { races: RaceResult[] }) {
  const events = [...new Set(races.filter(r => r.event && r.result_seconds).map(r => r.event!))]
  const [selectedEvent, setSelectedEvent] = useState(events[0] ?? '')

  // Time progression for selected event
  const progressionData = races
    .filter(r => r.event === selectedEvent && r.result_seconds && r.meet_date)
    .sort((a, b) => (a.meet_date ?? '').localeCompare(b.meet_date ?? ''))
    .map(r => ({
      date: formatDate(r.meet_date),
      seconds: r.result_seconds,
      result: r.result,
      meet: r.meet_name ?? '',
    }))

  const bestTime = progressionData.length > 0
    ? Math.min(...progressionData.map(d => d.seconds ?? 999))
    : null

  // Placement distribution
  const placementData = races
    .filter(r => r.placement && r.meet_date)
    .sort((a, b) => (a.meet_date ?? '').localeCompare(b.meet_date ?? ''))
    .slice(-12)
    .map(r => ({
      date: formatDate(r.meet_date),
      place: r.placement,
      event: r.event ?? r.sport,
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Time Progression */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">Time Progression</h3>
          {events.length > 0 && (
            <select
              className="bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text-primary"
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
            >
              {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          )}
        </div>
        {progressionData.length < 2 ? (
          <p className="text-text-muted text-sm">Need at least 2 results for the same event to show progression.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} reversed
                tickFormatter={v => {
                  const m = Math.floor(v / 60)
                  const s = Math.round(v % 60).toString().padStart(2, '0')
                  return `${m}:${s}`
                }}
              />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: number) => {
                  const m = Math.floor(v / 60)
                  const s = (v % 60).toFixed(2).padStart(5, '0')
                  return [`${m}:${s}`, 'Time']
                }}
              />
              {bestTime && <ReferenceLine y={bestTime} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'PR', fill: '#22c55e', fontSize: 11 }} />}
              <Line type="monotone" dataKey="seconds" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Placement trend */}
      <Card>
        <h3 className="font-bold text-text-primary mb-4">Placement Trend (Last 12)</h3>
        {placementData.length < 2 ? (
          <p className="text-text-muted text-sm">Log more races with placement data to see this chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={placementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} reversed />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: number) => [getPlacementSuffix(v), 'Place']}
              />
              <Bar dataKey="place" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}

function getPlacementSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
