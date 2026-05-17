import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeToSeconds(timeStr: string): number | null {
  if (!timeStr) return null
  const s = timeStr.trim()
  // H:MM:SS
  let m = s.match(/^(\d+):(\d+):(\d+\.?\d*)$/)
  if (m) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3])
  // MM:SS.s
  m = s.match(/^(\d+):(\d+\.?\d*)$/)
  if (m) return parseInt(m[1]) * 60 + parseFloat(m[2])
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

export function formatTime(seconds: number | null): string {
  if (seconds === null) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatPace(seconds: number | null, distanceMiles: number): string {
  if (!seconds || !distanceMiles) return '—'
  const paceSeconds = seconds / distanceMiles
  const m = Math.floor(paceSeconds / 60)
  const s = Math.round(paceSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}/mi`
}

export function getSportColor(sport: string): string {
  return sport === 'cross_country' ? '#22c55e' : '#3b82f6'
}

export function getSportLabel(sport: string): string {
  if (sport === 'cross_country') return 'Cross Country'
  if (sport === 'track') return 'Track'
  return sport
}

export function getPlacementSuffix(n: number | null): string {
  if (n === null) return '—'
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
