'use client'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: 'blue' | 'green' | 'none'
}

export function Card({ children, className, glow = 'none' }: CardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-bg-card bg-carbon backdrop-blur-sm p-6',
      glow === 'blue' && 'shadow-glow-blue border-brand-blue/20',
      glow === 'green' && 'shadow-glow-green border-brand-green/20',
      className
    )}>
      {children}
    </div>
  )
}
