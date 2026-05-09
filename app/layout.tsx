import type { Metadata } from 'next'
import { Outfit, Unbounded, Sora } from 'next/font/google'
import { Hind_Siliguri } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-geist',
})

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-unbounded',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-sora',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['latin', 'bengali'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind',
})

export const metadata: Metadata = {
  title: 'E-Vangariwala — আপনার বর্জ্য, আমাদের দায়িত্ব',
  description:
    "Bangladesh's modern doorstep scrap collection service. Sell, donate, or simply free up your space — we come to you, weigh honestly, and pay on the spot.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${unbounded.variable} ${sora.variable} ${hindSiliguri.variable}`}>
      <body>{children}</body>
    </html>
  )
}
