'use client'
import { useState } from 'react'
import { User, Camera } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface AthleteCardProps {
  profile: Profile | null
  onUpdate: (updates: Partial<Profile>) => Promise<unknown>
}

export function AthleteCard({ profile, onUpdate }: AthleteCardProps) {
  const [uploading, setUploading] = useState(false)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${profile.id}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await onUpdate({ avatar_url: publicUrl })
    }
    setUploading(false)
  }

  return (
    <Card glow="blue" className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-full bg-bg-elevated border-2 border-brand-blue/30 overflow-hidden flex items-center justify-center">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={28} className="text-text-muted" />
          )}
        </div>
        <label className="absolute -bottom-1 -right-1 cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center shadow-glow-blue">
            {uploading ? (
              <span className="text-white text-xs animate-spin">⟳</span>
            ) : (
              <Camera size={11} className="text-white" />
            )}
          </div>
        </label>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className="font-bold text-text-primary text-lg leading-tight">
          {profile?.display_name ?? profile?.athlete_name ?? 'Brady Holcomb'}
        </p>
        <p className="text-text-muted text-sm">{profile?.bio ?? 'Elite athlete. Always improving.'}</p>
        <p className="text-brand-blue text-xs mt-1 font-medium uppercase tracking-wider">
          Cross Country · Track &amp; Field
        </p>
      </div>
    </Card>
  )
}
