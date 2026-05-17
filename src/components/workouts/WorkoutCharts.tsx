'use client'
import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Workout } from '@/types'
import { formatDate } from '@/lib/utils'

const tooltipStyle = {
  backgroundColor: '#0d1117', border: '1px solid #1e2433',
  borderRadius: 8, color: '#e2e8f0', fontSize: 12,
}

export function WorkoutCharts({ workouts }: { workouts: Workout[] }) {
  const [liftExercise, setLiftExercise] = useState('')

  // Calories over time
  const caloriesData = [...workouts]
    .filter(w => w.calories_burned)
    .sort((a, b) => a.workout_date.localeCompare(b.workout_date))
    .map(w => ({ date: formatDate(w.workout_date), calories: w.calories_burned }))

  // Unique exercises for weight progression
  const exercises = [...new Set(workouts.filter(w => w.weight_lbs).map(w => w.exercise_name))]
  const selectedEx = liftExercise || exercises[0] || ''
  const liftData = [...workouts]
    .filter(w => w.exercise_name === selectedEx && w.weight_lbs)
    .sort((a, b) => a.workout_date.localeCompare(b.workout_date))
    .map(w => ({ date: formatDate(w.workout_date), weight: w.weight_lbs }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calories */}
      <Card>
        <h3 className="font-bold text-text-primary mb-4">Calories Burned Over Time</h3>
        {caloriesData.length < 2 ? (
          <p className="text-text-muted text-sm">Log more workouts with calories to see the chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Strength progression */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">Strength Progression</h3>
          {exercises.length > 0 && (
            <select
              className="bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text-primary"
              value={selectedEx}
              onChange={e => setLiftExercise(e.target.value)}
            >
              {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          )}
        </div>
        {liftData.length < 2 ? (
          <p className="text-text-muted text-sm">Log weighted exercises to see progression.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={liftData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit=" lbs" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="weight" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
