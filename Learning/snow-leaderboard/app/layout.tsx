import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Snowball Fight',
  description: 'An Aram snowballs hit leaderboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  )
}