import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brady Holcomb | Athletic Performance',
  description: 'Elite athlete performance tracker — race results, workouts, and personal records.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-text-primary min-h-screen">{children}</body>
    </html>
  )
}
