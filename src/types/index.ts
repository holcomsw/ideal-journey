export interface RaceResult {
  id: string
  athlete_name: string
  sport: string
  event: string | null
  meet_name: string | null
  meet_date: string | null
  result: string | null
  result_seconds: number | null
  placement: number | null
  team: string | null
  grade: string | null
  season_year: number | null
  source: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  exercise_name: string
  workout_date: string
  sets: number | null
  reps: number | null
  weight_lbs: number | null
  running_distance_miles: number | null
  running_time_seconds: number | null
  calories_burned: number | null
  notes: string | null
  mood: number | null
  energy_level: number | null
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  type: string
  title: string
  description: string | null
  icon: string | null
  unlocked_at: string
}

export interface PersonalRecord {
  id: string
  user_id: string
  sport: string
  event: string
  result: string
  result_seconds: number | null
  achieved_at: string | null
  meet_name: string | null
  created_at: string
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  athlete_name: string | null
  created_at: string
}

export interface WorkoutFormData {
  exercise_name: string
  workout_date: string
  sets: string
  reps: string
  weight_lbs: string
  running_distance_miles: string
  running_time_seconds: string
  calories_burned: string
  notes: string
  mood: number
  energy_level: number
}

export interface RaceFormData {
  sport: string
  event: string
  meet_name: string
  meet_date: string
  result: string
  placement: string
  grade: string
  season_year: string
}
