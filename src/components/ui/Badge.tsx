'use client'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'gold' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      variant === 'blue' && 'bg-brand-blueDim text-brand-blue border border-brand-blue/20',
      variant === 'green' && 'bg-brand-greenDim text-brand-green border border-brand-green/20',
      variant === 'gold' && 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      variant === 'muted' && 'bg-bg-elevated text-text-muted border border-border',
      className
    )}>
      {children}
    </span>
  )
}

export function PRBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
      ⚡ PR
    </span>
  )
}
