'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RaceResult, RaceFormData } from '@/types'
import { timeToSeconds } from '@/lib/utils'

export function useRaces(athleteName: string | null) {
  const [races, setRaces] = useState<RaceResult[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRaces = useCallback(async () => {
    if (!athleteName) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('athletic_results')
      .select('*')
      .eq('athlete_name', athleteName)
      .order('meet_date', { ascending: false })
    setRaces(data ?? [])
    setLoading(false)
  }, [athleteName])

  useEffect(() => { fetchRaces() }, [fetchRaces])

  async function addRace(form: RaceFormData) {
    const result_seconds = timeToSeconds(form.result)
    const { error } = await supabase.from('athletic_results').insert({
      athlete_name: athleteName ?? 'Brady Holcomb',
      sport: form.sport,
      event: form.event || null,
      meet_name: form.meet_name || null,
      meet_date: form.meet_date || null,
      result: form.result || null,
      result_seconds,
      placement: form.placement ? parseInt(form.placement) : null,
      grade: form.grade || null,
      season_year: form.season_year ? parseInt(form.season_year) : null,
      source: 'manual',
    })
    if (!error) await fetchRaces()
    return error
  }

  async function updateRace(id: string, form: RaceFormData) {
    const result_seconds = timeToSeconds(form.result)
    const { error } = await supabase.from('athletic_results').update({
      sport: form.sport,
      event: form.event || null,
      meet_name: form.meet_name || null,
      meet_date: form.meet_date || null,
      result: form.result || null,
      result_seconds,
      placement: form.placement ? parseInt(form.placement) : null,
      grade: form.grade || null,
      season_year: form.season_year ? parseInt(form.season_year) : null,
    }).eq('id', id)
    if (!error) await fetchRaces()
    return error
  }

  async function deleteRace(id: string) {
    const { error } = await supabase.from('athletic_results').delete().eq('id', id)
    if (!error) await fetchRaces()
    return error
  }

  // Build a map of event -> best result_seconds for PR detection
  const prMap = races.reduce<Record<string, number>>((acc, r) => {
    if (!r.event || !r.result_seconds) return acc
    if (!acc[r.event] || r.result_seconds < acc[r.event]) acc[r.event] = r.result_seconds
    return acc
  }, {})

  function isPR(race: RaceResult): boolean {
    if (!race.event || !race.result_seconds) return false
    return prMap[race.event] === race.result_seconds
  }

  return { races, loading, addRace, updateRace, deleteRace, isPR, prMap, refetch: fetchRaces }
}
