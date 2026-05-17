'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signup') {
      const err = await signUp(email, password)
      if (err) {
        setError(err.message)
      } else {
        setSuccess('Account created! Check your email for a confirmation link, then sign in.')
        setMode('signin')
      }
      setLoading(false)
    } else {
      const err = await signIn(email, password)
      if (err) {
        setError(err.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    }
  }

  const inputCls = 'w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-blue/60 focus:shadow-glow-blue transition-all duration-200 text-sm'

  return (
    <div className="min-h-screen bg-bg-base bg-carbon flex items-center justify-center p-4">
      <div className="fixed top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-green mx-auto mb-4 flex items-center justify-center shadow-glow-blue">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-text-primary">BradyRuns</h1>
          <p className="text-text-muted text-sm mt-1">Elite Performance Tracker</p>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-card bg-carbon">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent rounded-t-2xl" />

          {/* Mode tabs */}
          <div className="flex bg-bg-elevated rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-brand-blue text-white shadow-glow-blue'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium uppercase tracking-wider">
                Email
              </label>
              <input
                type="email" required autoComplete="email"
                className={inputCls} placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className={inputCls + ' pr-10'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-900/15 border border-red-800/30 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-brand-green text-sm bg-brand-green/10 border border-brand-green/30 rounded-lg px-3 py-2">
                {success}
              </motion.p>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </span>
              ) : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Train Strong. Race Faster. ⚡
        </p>
      </motion.div>
    </div>
  )
}
