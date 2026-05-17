'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'green'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' && 'bg-brand-blue text-white hover:bg-blue-400 shadow-glow-blue',
        variant === 'green' && 'bg-brand-green text-black hover:bg-green-400 shadow-glow-green',
        variant === 'ghost' && 'border border-border text-text-primary hover:border-brand-blue/40 hover:bg-brand-blueDim',
        variant === 'danger' && 'border border-red-800/40 text-red-400 hover:bg-red-900/20',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
