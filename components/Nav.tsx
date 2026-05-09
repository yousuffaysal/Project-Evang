'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavProps {
  dark?: boolean
}

export default function Nav({ dark: initialDark }: NavProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    const handleScrollActive = () => {
      const pricesSec = document.getElementById('prices')
      const bookSec = document.getElementById('book')
      const scrollY = window.scrollY
      
      if (bookSec && scrollY >= bookSec.offsetTop - 180) {
        setActiveHash('#book')
      } else if (pricesSec && scrollY >= pricesSec.offsetTop - 180) {
        setActiveHash('#prices')
      } else {
        setActiveHash('')
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('scroll', handleScrollActive)
    
    // Initial checks
    handleScroll()
    handleScrollActive()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScrollActive)
    }
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#prices', label: 'Prices' },
    { href: '/#book', label: 'Book' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && activeHash === ''
    }
    if (href.startsWith('/#')) {
      const hash = href.replace('/', '') // e.g. '#prices'
      return pathname === '/' && activeHash === hash
    }
    return pathname === href
  }

  const isDark = scrolled || initialDark

  return (
    <nav className={`nav${isDark ? ' dark' : ''}${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="brand" style={isDark ? { color: 'var(--navy)' } : {}}>
        <img src="/logo.png" alt="E-Vangariwala Logo" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-unbounded), sans-serif', marginLeft: '12px', letterSpacing: '-0.04em' }}>E-Vangariwala</span>
      </Link>

      <div className="navpill">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
        <div className="v-sep" />
        <Link href="/admin" className="nav-login">
          Log in
        </Link>
        <Link href="/admin?signup=true" className="nav-signup">
          Sign up
        </Link>
      </div>

      <Link href="/#book" className="cta">
        Book Pickup
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </nav>
  )
}
