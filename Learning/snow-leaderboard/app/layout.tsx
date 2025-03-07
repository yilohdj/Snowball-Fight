import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Snow Leaderboard',
  description: 'A stylized leaderboard with a snow theme',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}