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
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
    <>
      <nav className={`nav${isDark ? ' dark' : ''}${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}>
        <Link href="/" className="brand" style={isDark && !menuOpen ? { color: 'var(--navy)' } : {}} onClick={() => setMenuOpen(false)}>
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

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="drawer-divider" />
          <Link href="/admin" className="drawer-btn-login" onClick={() => setMenuOpen(false)}>
            Log in
          </Link>
          <Link href="/admin?signup=true" className="drawer-btn-signup" onClick={() => setMenuOpen(false)}>
            Sign up
          </Link>
        </div>
      </div>
    </>
  )
}
