'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Workout, WorkoutFormData, Achievement } from '@/types'

export function useWorkouts(userId: string | null) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  const fetchWorkouts = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const [{ data: w }, { data: a }] = await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', userId).order('workout_date', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', userId).order('unlocked_at', { ascending: false }),
    ])
    setWorkouts(w ?? [])
    setAchievements(a ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  async function awardAchievement(type: string, title: string, description: string, icon: string) {
    if (!userId) return
    const already = achievements.find(a => a.type === type)
    if (already) return
    const { data } = await supabase
      .from('achievements')
      .insert({ user_id: userId, type, title, description, icon })
      .select()
      .single()
    if (data) {
      setAchievements(prev => [data, ...prev])
      setNewAchievement(data)
      setTimeout(() => setNewAchievement(null), 4000)
    }
  }

  async function addWorkout(form: WorkoutFormData) {
    if (!userId) return null
    const payload = {
      user_id: userId,
      exercise_name: form.exercise_name,
      workout_date: form.workout_date,
      sets: form.sets ? parseInt(form.sets) : null,
      reps: form.reps ? parseInt(form.reps) : null,
      weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : null,
      running_distance_miles: form.running_distance_miles ? parseFloat(form.running_distance_miles) : null,
      running_time_seconds: form.running_time_seconds ? parseInt(form.running_time_seconds) : null,
      calories_burned: form.calories_burned ? parseInt(form.calories_burned) : null,
      notes: form.notes || null,
      mood: form.mood,
      energy_level: form.energy_level,
    }
    const { error } = await supabase.from('workouts').insert(payload)
    if (error) return error

    await fetchWorkouts()

    // First workout achievement
    if (workouts.length === 0) {
      await awardAchievement('first_workout', 'First Workout!', 'You logged your first workout', '🏁')
    }

    // Lift PR detection
    if (payload.weight_lbs) {
      const prevBest = workouts
        .filter(w => w.exercise_name === form.exercise_name && w.weight_lbs)
        .reduce((max, w) => Math.max(max, w.weight_lbs!), 0)
      if (payload.weight_lbs > prevBest) {
        await awardAchievement(
          `pr_lift_${form.exercise_name.toLowerCase().replace(/\s+/g, '_')}`,
          'New Lift PR! 🏋️',
          `New best for ${form.exercise_name}: ${payload.weight_lbs} lbs`,
          '🏋️'
        )
      }
      if (payload.weight_lbs >= 200) {
        await awardAchievement('heavy_lifter', 'Heavy Lifter 💪', 'Lifted 200+ lbs in a single set', '💪')
      }
    }

    // Distance milestone
    const totalMiles = workouts.reduce((sum, w) => sum + (w.running_distance_miles ?? 0), 0)
      + (payload.running_distance_miles ?? 0)
    if (totalMiles >= 10) {
      await awardAchievement('distance_10', '10-Mile Club 📏', 'Logged 10 total miles of running', '📏')
    }

    return null
  }

  async function updateWorkout(id: string, form: WorkoutFormData) {
    const { error } = await supabase.from('workouts').update({
      exercise_name: form.exercise_name,
      workout_date: form.workout_date,
      sets: form.sets ? parseInt(form.sets) : null,
      reps: form.reps ? parseInt(form.reps) : null,
      weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : null,
      running_distance_miles: form.running_distance_miles ? parseFloat(form.running_distance_miles) : null,
      running_time_seconds: form.running_time_seconds ? parseInt(form.running_time_seconds) : null,
      calories_burned: form.calories_burned ? parseInt(form.calories_burned) : null,
      notes: form.notes || null,
      mood: form.mood,
      energy_level: form.energy_level,
    }).eq('id', id)
    if (!error) await fetchWorkouts()
    return error
  }

  async function deleteWorkout(id: string) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) await fetchWorkouts()
    return error
  }

  return {
    workouts, achievements, loading, newAchievement,
    addWorkout, updateWorkout, deleteWorkout, refetch: fetchWorkouts,
  }
}
