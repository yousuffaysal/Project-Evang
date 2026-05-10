'use client'

import { useEffect, useState } from 'react'

type Role = 'admin' | 'dispatcher' | 'editor'
type View = 'dashboard' | 'pickups' | 'prices' | 'areas' | 'blog' | 'users' | 'settings' | 'contact'

interface User { id: number; email: string; name: string; role: Role; title: string; initials: string }
interface Pickup { id: number; booking_ref: string; customer_name: string; phone: string; address: string; area: string; status: string; estimated_value: number; created_at: string; scrap_types: string[]; assigned_crew: string }
interface PriceRow { id: number; name: string; name_bn: string; category: string; price: number; unit: string; is_active: boolean }
interface AreaRow { id: number; name_en: string; name_bn: string; crews_assigned: number; is_active: boolean; pickups_30d: number }
interface BlogPost { id: number; title: string; category: string; author_name: string; status: string; published_at: string; read_count: number }
interface TeamMember { id: number; email: string; full_name: string; role: string; title: string; avatar_initials: string }
interface ContactMessage { id: number; full_name: string; phone: string; email: string | null; reason: string | null; message: string; is_read: boolean; created_at: string }

interface Stats {
  kpis: { total_pickups: number; pending_pickups: number; completed_this_month: number; revenue_this_month: number; unread_messages: number; subscribers: number }
  chart: { label: string; value: number }[]
  areas: { area: string; count: number }[]
  recent_pickups: Pickup[]
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'b-pending',
  confirmed: 'b-progress',
  in_progress: 'b-progress',
  completed: 'b-done',
  cancelled: 'b-cancel',
}

const POST_BADGE: Record<string, string> = {
  published: 'b-done',
  draft: 'b-pending',
  scheduled: 'b-progress',
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPostForm, setNewPostForm] = useState({ title: '', category: 'industry', excerpt: '' })
  const [submittingPost, setSubmittingPost] = useState(false)

  // Auth Redesign states
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [signingUp, setSigningUp] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data
  const [stats, setStats] = useState<Stats | null>(null)
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [prices, setPrices] = useState<PriceRow[]>([])
  const [priceEdits, setPriceEdits] = useState<Record<number, string>>({})
  const [showNewPriceModal, setShowNewPriceModal] = useState(false)
  const [editingPrice, setEditingPrice] = useState<PriceRow | null>(null)
  const [newPriceForm, setNewPriceForm] = useState({ name: '', name_bn: '', category: 'paper', price: '', unit: 'kg' })
  const [submittingPrice, setSubmittingPrice] = useState(false)
  const [areas, setAreas] = useState<AreaRow[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [activeMsgId, setActiveMsgId] = useState<number | null>(null)

  // Check session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setUser({ id: Number(d.user.sub), email: d.user.email, name: d.user.name, role: d.user.role as Role, title: '', initials: d.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) }) })
      .catch(() => {})

    // Check URL parameters for signup
    const params = new URLSearchParams(window.location.search)
    if (params.get('signup') === 'true') {
      setIsSignUp(true)
    }
  }, [])

  // Fetch data when view changes
  useEffect(() => {
    if (!user) return
    if (currentView === 'dashboard') {
      fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
    } else if (currentView === 'pickups') {
      fetch('/api/pickups').then(r => r.json()).then(d => setPickups(d.pickups || [])).catch(() => {})
    } else if (currentView === 'prices') {
      fetch('/api/prices').then(r => r.json()).then(d => setPrices(d.prices || [])).catch(() => {})
    } else if (currentView === 'areas') {
      fetch('/api/areas').then(r => r.json()).then(d => setAreas(d.areas || [])).catch(() => {})
    } else if (currentView === 'blog') {
      fetch('/api/blog?status=published').then(r => r.json()).then(d => setBlogPosts(d.posts || [])).catch(() => {})
      fetch('/api/blog?status=draft').then(r => r.json()).then(d => setBlogPosts(prev => [...prev, ...(d.posts || [])]) ).catch(() => {})
    } else if (currentView === 'users') {
      fetch('/api/admin/users').then(r => r.json()).then(d => setTeamMembers(d.users || [])).catch(() => {})
    } else if (currentView === 'contact') {
      fetch('/api/contact').then(r => r.json()).then(d => setContactMessages(d.messages || [])).catch(() => {})
    }
  }, [currentView, user])

  useEffect(() => {
    if (contactMessages.length > 0 && activeMsgId === null) {
      setActiveMsgId(contactMessages[0].id)
    }
  }, [contactMessages, activeMsgId])

  const handleToggleRead = async (id: number, currentRead: boolean) => {
    try {
      await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: !currentRead })
      })
      setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentRead } : m))
    } catch {}
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      })
      const data = await res.json()
      if (data.ok) {
        setUser(data.user)
      } else {
        setLoginError(data.error || 'Invalid credentials.')
      }
    } catch {
      setLoginError('Network error. Please try again.')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSigningUp(true)
    setTimeout(() => {
      setSigningUp(false)
      setSignUpSuccess(true)
      setIsSignUp(false)
      setSignUpForm({ name: '', email: '', password: '', phone: '' })
    }, 1500)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setCurrentView('dashboard')
  }

  const savePrices = async () => {
    const updates = prices
      .filter(p => priceEdits[p.id] !== undefined)
      .map(p => ({ ...p, price: Number(priceEdits[p.id] ?? p.price) }))
    if (!updates.length) return
    await fetch('/api/prices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prices: updates }) })
    setPrices(prev => prev.map(p => priceEdits[p.id] !== undefined ? { ...p, price: Number(priceEdits[p.id]) } : p))
    setPriceEdits({})
    alert('Prices saved.')
  }

  const handleCreatePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingPrice(true)
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPriceForm.name,
          name_bn: newPriceForm.name_bn || null,
          category: newPriceForm.category,
          price: Number(newPriceForm.price),
          unit: newPriceForm.unit
        })
      })
      const data = await res.json()
      if (data.ok) {
        setPrices(prev => [...prev, data.price])
        setShowNewPriceModal(false)
        setNewPriceForm({ name: '', name_bn: '', category: 'paper', price: '', unit: 'kg' })
        alert('Price item created successfully!')
      } else {
        alert(data.error || 'Failed to add price.')
      }
    } catch (err) {
      alert('Error creating price.')
    } finally {
      setSubmittingPrice(false)
    }
  }

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPrice) return
    setSubmittingPrice(true)
    try {
      const res = await fetch(`/api/prices/${editingPrice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingPrice.name,
          name_bn: editingPrice.name_bn || null,
          category: editingPrice.category,
          price: Number(editingPrice.price),
          unit: editingPrice.unit,
          is_active: editingPrice.is_active
        })
      })
      const data = await res.json()
      if (data.ok) {
        setPrices(prev => prev.map(p => p.id === editingPrice.id ? data.price : p))
        setEditingPrice(null)
        alert('Price item updated successfully!')
      } else {
        alert(data.error || 'Failed to update price.')
      }
    } catch (err) {
      alert('Error updating price.')
    } finally {
      setSubmittingPrice(false)
    }
  }

  const handleDeletePrice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this price item?')) return
    try {
      const res = await fetch(`/api/prices/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setPrices(prev => prev.filter(p => p.id !== id))
        alert('Price item deleted successfully!')
      } else {
        alert(data.error || 'Failed to delete price.')
      }
    } catch (err) {
      alert('Error deleting price.')
    }
  }

  const updatePickupStatus = async (id: number, status: string) => {
    await fetch(`/api/pickups/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const handleNewPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingPost(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostForm)
      })
      const data = await res.json()
      if (data.ok) {
        setBlogPosts(prev => [data.post, ...prev])
        setShowNewPostModal(false)
        setNewPostForm({ title: '', category: 'industry', excerpt: '' })
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch {
      alert('Network error')
    } finally {
      setSubmittingPost(false)
    }
  }

  const isAdmin = user?.role === 'admin'
  const canSeePickups = user?.role !== 'editor'
  const canSeePrices = user?.role !== 'editor'
  const canSeeAreas = user?.role !== 'editor'
  const canSeeBlog = user?.role !== 'dispatcher'

  type NavItem = { view: View; label: string; icon: React.ReactNode }
  const navItems: NavItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg> },
    ...(canSeePickups ? [{ view: 'pickups' as View, label: 'Pickups', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="14" height="11" rx="2" /><path d="M16 10h4l2 4v3h-6" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg> }] : []),
    { view: 'contact' as View, label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
    ...(canSeePrices ? [{ view: 'prices' as View, label: 'Prices', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9a3 3 0 100 6h6a3 3 0 110 6H7" /></svg> }] : []),
    ...(canSeeAreas ? [{ view: 'areas' as View, label: 'Service Areas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z" /><circle cx="12" cy="9" r="3" /></svg> }] : []),
    ...(canSeeBlog ? [{ view: 'blog' as View, label: 'Blog Posts', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg> }] : []),
    ...(isAdmin ? [
      { view: 'users' as View, label: 'Team & Roles', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="4" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="8" r="3" /><path d="M21 20c0-2-2-4-4-4" /></svg> },
      { view: 'settings' as View, label: 'Settings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg> },
    ] : []),
  ]

  if (!user) {
    return (
      <section className="login-page">
        <div className="login-left">
          <div className="login-brand" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="E-Vangariwala Logo" style={{ height: 68, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-unbounded), sans-serif', color: '#fff', marginLeft: '14px', letterSpacing: '-0.04em' }}>E-Vangariwala</span>
          </div>
          <div>
            <div className="login-display">Your doorstep <span className="lime">recycling hub.</span></div>
            <p style={{ marginTop: 24, fontSize: 18, color: 'rgba(255,255,255,.7)', maxWidth: 460, lineHeight: 1.6, position: 'relative' }}>
              Turn your scrap, clutter, and recyclables into real cash or donate them to save the environment. Book pickups, track your history, and help clean Dhaka.
            </p>
          </div>
          <div className="login-left-footer">© 2026 E-Vangariwala · Friendly doorstep scrap collectors</div>
        </div>
        <div className="login-right">
          <div className="login-right-inner">
            <div className="form-toggle-wrap">
              <button className={`toggle-tab ${!isSignUp ? 'active' : ''}`} onClick={() => { setIsSignUp(false); setSignUpSuccess(false); }}>Log In</button>
              <button className={`toggle-tab ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>

            {signUpSuccess ? (
              <div className="success-box" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h2>Account Requested!</h2>
                <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>
                  Your account request has been logged successfully! Our admins will verify and activate your dashboard access shortly.
                </p>
                <button className="login-submit" style={{ marginTop: 24 }} onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}>Go to Log In</button>
              </div>
            ) : isSignUp ? (
              <div>
                <p className="micro">// CREATE ACCOUNT</p>
                <h1>Join E-Vangariwala.</h1>
                <p className="sub">Start recycling and tracking your ecological footprint today.</p>
                <form onSubmit={handleSignUpSubmit}>
                  <div className="field">
                    <label>Full Name</label>
                    <input type="text" required value={signUpForm.name} onChange={e => setSignUpForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" required value={signUpForm.email} onChange={e => setSignUpForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input type="tel" required value={signUpForm.phone} onChange={e => setSignUpForm(f => ({ ...f, phone: e.target.value }))} placeholder="017XXXXXXXX" />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input type="password" required value={signUpForm.password} onChange={e => setSignUpForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                  </div>
                  <button type="submit" className="login-submit" disabled={signingUp}>
                    {signingUp ? 'Registering…' : 'Create Account →'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <p className="micro">// SECURE LOGIN</p>
                <h1>Welcome back.</h1>
                <p className="sub">Sign in to continue to your dashboard. Your role determines your access.</p>
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input type="password" required value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                  </div>
                  {loginError && <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{loginError}</div>}
                  <button type="submit" className="login-submit" disabled={loggingIn}>
                    {loggingIn ? 'Signing in…' : 'Sign in →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  const firstName = user.name.split(' ')[0]
  const roleTag = user.role.toUpperCase()

  return (
    <section className="dash">
      {/* Mobile Sticky Header */}
      <div className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="E-Vangariwala Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-unbounded), sans-serif', color: '#fff', letterSpacing: '-0.04em' }}>E-Vangariwala</span>
        </div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Navigation Menu">
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Backdrop for closing slideout menu */}
      {mobileMenuOpen && (
        <div className="admin-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Slide-out Sidebar Drawer */}
      <aside className={mobileMenuOpen ? 'open' : ''}>
        <div className="aside-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="E-Vangariwala Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-unbounded), sans-serif', color: '#fff', letterSpacing: '-0.04em' }}>E-Vangariwala</span>
          </div>
          <span className="role-tag" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '2px' }}>{roleTag}</span>
        </div>
        <nav className="aside-nav">
          <div className="aside-section">Overview</div>
          <ul>
            {navItems.filter(i => !['users','settings'].includes(i.view)).map(item => (
              <li key={item.view}>
                <a className={currentView === item.view ? 'active' : ''} onClick={() => { setCurrentView(item.view); setMobileMenuOpen(false); }}>
                  {item.icon}{item.label}
                </a>
              </li>
            ))}
          </ul>
          {isAdmin && (
            <>
              <div className="aside-section">Admin Only</div>
              <ul>
                {navItems.filter(i => ['users','settings'].includes(i.view)).map(item => (
                  <li key={item.view}>
                    <a className={currentView === item.view ? 'active' : ''} onClick={() => { setCurrentView(item.view); setMobileMenuOpen(false); }}>
                      {item.icon}{item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
        <div className="aside-footer">
          <div>{user.name} · {user.role}</div>
          <div className="logout" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Sign out</div>
        </div>
      </aside>

      <main>
        {/* DASHBOARD */}
        {currentView === 'dashboard' && (
          <div>
            <div className="topbar">
              <div>
                <h1>Good morning, {firstName}.</h1>
                <div className="sub">Here&apos;s what&apos;s happening across all service areas today.</div>
              </div>
              <div className="topbar-actions">
                <input className="search" placeholder="Search pickups, customers…" />
                <button className="pill lime" onClick={() => setCurrentView('pickups')}>+ New Pickup</button>
              </div>
            </div>
            <div className="kpis">
              <div className="kpi">
                <div className="l">Total pickups</div>
                <div className="v">{!stats ? <div className="skeleton" style={{ height: 38, width: 60, margin: '4px 0' }} /> : stats.kpis.total_pickups}</div>
                <div className="delta">All time</div>
              </div>
              <div className="kpi">
                <div className="l">Pending bookings</div>
                <div className="v">{!stats ? <div className="skeleton" style={{ height: 38, width: 60, margin: '4px 0' }} /> : stats.kpis.pending_pickups}</div>
                <div className="delta">Awaiting confirmation</div>
              </div>
              <div className="kpi">
                <div className="l">Completed this month</div>
                <div className="v">{!stats ? <div className="skeleton" style={{ height: 38, width: 60, margin: '4px 0' }} /> : stats.kpis.completed_this_month}</div>
                <div className="delta">↑ Current month</div>
              </div>
              <div className="kpi">
                <div className="l">Revenue (this month)</div>
                <div className="v">{!stats ? <div className="skeleton" style={{ height: 38, width: 100, margin: '4px 0' }} /> : `৳${Number(stats.kpis.revenue_this_month).toLocaleString()}`}</div>
                <div className="delta">From completed pickups</div>
              </div>
            </div>

            <div className="cols">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h3>Pickup volume</h3>
                    <div className="sub">Last 7 days</div>
                  </div>
                </div>
                <div className="chart">
                  {!stats ? (
                    Array.from({ length: 7 }).map((_, i) => <div key={i} className="bar skeleton" style={{ height: Math.max(Math.random() * 100, 20) }} />)
                  ) : (
                    (stats.chart || []).map((d, i) => (
                      <div key={i} className="bar dark" style={{ height: Math.max(d.value * 6, 4) }} title={`${d.value} pickups`} />
                    ))
                  )}
                </div>
                <div className="x-axis">
                  {!stats ? (
                    Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 12, width: 30 }} />)
                  ) : (
                    (stats.chart || []).map((d, i) => <div key={i}>{d.label}</div>)
                  )}
                </div>
              </div>
              <div className="panel">
                <h3>Top areas</h3>
                <div className="sub">By pickups (all time)</div>
                {!stats ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="area-row">
                      <div style={{ flex: 1 }}><div className="skeleton" style={{ height: 16, width: 100, marginBottom: 6 }} /><div className="skeleton" style={{ height: 4, width: '100%' }} /></div>
                      <div className="skeleton" style={{ height: 16, width: 24, marginLeft: 16 }} />
                    </div>
                  ))
                ) : (
                  (stats.areas || []).map((a) => {
                    const max = Math.max(...(stats.areas || []).map(x => x.count), 1)
                    return (
                      <div key={a.area} className="area-row">
                        <div>
                          <div>{a.area}</div>
                          <div className="progress"><span style={{ width: `${(a.count / max) * 100}%` }} /></div>
                        </div>
                        <div className="v">{a.count}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div><h3>Recent pickups</h3><div className="sub">Latest bookings</div></div>
                <button className="pill" onClick={() => setCurrentView('pickups')}>View all →</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Ref</th><th>Customer</th><th>Phone</th><th>Area</th><th>Value</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {!stats ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td><div className="skeleton" style={{ height: 18, width: 100 }} /></td>
                        <td><div className="skeleton" style={{ height: 18, width: 120 }} /></td>
                        <td><div className="skeleton" style={{ height: 18, width: 100 }} /></td>
                        <td><div className="skeleton" style={{ height: 18, width: 80 }} /></td>
                        <td><div className="skeleton" style={{ height: 18, width: 60 }} /></td>
                        <td><div className="skeleton" style={{ height: 18, width: 80 }} /></td>
                        <td><div className="skeleton" style={{ height: 26, width: 60, borderRadius: 100 }} /></td>
                      </tr>
                    ))
                  ) : (
                    (stats.recent_pickups || []).map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.booking_ref}</strong></td>
                        <td>{p.customer_name}</td>
                        <td>{p.phone || '—'}</td>
                        <td>{p.area || '—'}</td>
                        <td>{p.estimated_value ? `৳${Number(p.estimated_value).toLocaleString()}` : '—'}</td>
                        <td><span className={`badge ${STATUS_CLASS[p.status] || ''}`}>{p.status}</span></td>
                        <td><button className="pill" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setSelectedPickup(p as Pickup)}>Details</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PICKUPS */}
        {currentView === 'pickups' && (
          <div>
            <div className="topbar">
              <div><h1>Pickups</h1><div className="sub">All bookings from the public form.</div></div>
              <div className="topbar-actions">
                <input className="search" placeholder="Search by name, phone, ref…" />
              </div>
            </div>
            <div className="panel">
              <table className="admin-table">
                <thead><tr><th>Ref</th><th>Customer</th><th>Phone</th><th>Area</th><th>Purpose</th><th>Value</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {pickups.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.booking_ref}</strong></td>
                      <td>{p.customer_name}</td>
                      <td>{p.phone}</td>
                      <td>{p.area || '—'}</td>
                      <td>{(p.scrap_types || []).join(', ') || '—'}</td>
                      <td>{p.estimated_value ? `৳${Number(p.estimated_value).toLocaleString()}` : '—'}</td>
                      <td>
                        <select
                          value={p.status}
                          onChange={e => updatePickupStatus(p.id, e.target.value)}
                          style={{ border: '1px solid var(--hair)', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit' }}
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="in_progress">in_progress</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td><button className="pill" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setSelectedPickup(p)}>Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRICES */}
        {currentView === 'prices' && (
          <div>
            <div className="topbar">
              <div><h1>Scrap price list</h1><div className="sub">Edit and publish the live rate card. Changes appear on the public site instantly.</div></div>
              <div className="topbar-actions">
                <button className="pill dark" onClick={() => setShowNewPriceModal(true)} style={{ marginRight: '8px' }}>+ Add item</button>
                <button className="pill lime" onClick={savePrices}>Publish changes</button>
              </div>
            </div>
            <div className="panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Bangla Name</th>
                    <th>Category</th>
                    <th>Price (৳)</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.name_bn || '—'}</td>
                      <td><span className="badge b-progress" style={{ textTransform: 'capitalize' }}>{p.category}</span></td>
                      <td>
                        <input
                          value={priceEdits[p.id] !== undefined ? priceEdits[p.id] : String(p.price)}
                          onChange={e => setPriceEdits(prev => ({ ...prev, [p.id]: e.target.value }))}
                          style={{ border: '1px solid var(--hair)', borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: 13, width: 100, outline: 'none' }}
                        />
                      </td>
                      <td>{p.unit}</td>
                      <td>
                        <span className={`badge ${p.is_active ? 'b-done' : 'b-cancel'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="pill"
                          onClick={() => setEditingPrice(p)}
                          style={{ padding: '6px 12px', fontSize: '11px', marginRight: '6px', background: 'rgba(1,33,82,0.05)', color: 'var(--navy)' }}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="pill"
                          onClick={() => handleDeletePrice(p.id)}
                          style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AREAS */}
        {currentView === 'areas' && (
          <div>
            <div className="topbar">
              <div><h1>Service areas</h1><div className="sub">Manage which neighbourhoods we currently cover.</div></div>
              <div className="topbar-actions"><button className="pill lime">+ Add area</button></div>
            </div>
            <div className="panel">
              <table className="admin-table">
                <thead><tr><th>Area</th><th>Bangla</th><th>Crews</th><th>Active</th><th>Pickups (30d)</th><th></th></tr></thead>
                <tbody>
                  {areas.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.name_en}</strong></td>
                      <td>{a.name_bn}</td>
                      <td>{a.crews_assigned}</td>
                      <td><span className={`badge ${a.is_active ? 'b-done' : 'b-cancel'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>{a.pickups_30d}</td>
                      <td><span className="row-action">⋯</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BLOG */}
        {currentView === 'blog' && (
          <div>
            <div className="topbar">
              <div><h1>Blog posts</h1><div className="sub">Draft, schedule, and publish awareness articles.</div></div>
              <div className="topbar-actions"><button className="pill lime" onClick={() => setShowNewPostModal(true)}>+ New post</button></div>
            </div>
            <div className="panel">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Published</th><th>Reads</th></tr></thead>
                <tbody>
                  {blogPosts.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.category}</td>
                      <td>{p.author_name}</td>
                      <td><span className={`badge ${POST_BADGE[p.status] || ''}`}>{p.status}</span></td>
                      <td>{p.published_at ? new Date(p.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td>{p.read_count || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {currentView === 'users' && (
          <div>
            <div className="topbar">
              <div><h1>Team & roles</h1><div className="sub">Admin-only. Manage who can do what across the platform.</div></div>
              <div className="topbar-actions"><button className="pill lime">+ Invite member</button></div>
            </div>
            <div className="user-grid">
              {teamMembers.map(u => (
                <div key={u.id} className="ucard">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="av">{u.avatar_initials}</div>
                    <div>
                      <div className="ttl">{u.full_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>{u.title}</div>
                  <span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', fontWeight: 500, margin: '40px 0 16px' }}>Permissions matrix</h2>
            <div className="panel">
              <div className="perm">
                <div className="head">Capability</div>
                <div className="head">Admin</div>
                <div className="head">Dispatcher</div>
                <div className="head">Editor</div>
                {([
                  ['View dashboard', true, true, true],
                  ['Manage pickups', true, true, false],
                  ['Edit prices', true, false, false],
                  ['Edit service areas', true, false, false],
                  ['Publish blog posts', true, false, true],
                  ['Invite & manage team', true, false, false],
                  ['Access settings', true, false, false],
                ] as [string, boolean, boolean, boolean][]).map(([cap, a, d, ed]) => (
                  <>
                    <div key={cap}>{cap}</div>
                    <div><span className={a ? 'dot-y' : 'dot-n'}>{a ? '✓' : '—'}</span></div>
                    <div><span className={d ? 'dot-y' : 'dot-n'}>{d ? '✓' : '—'}</span></div>
                    <div><span className={ed ? 'dot-y' : 'dot-n'}>{ed ? '✓' : '—'}</span></div>
                  </>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT MESSAGES */}
        {currentView === 'contact' && (
          <div>
            <div className="topbar">
              <div>
                <h1>Inquiries & Messages</h1>
                <div className="sub">Messages sent by visitors via the public Contact Form.</div>
              </div>
            </div>
            {contactMessages.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px 24px',
                background: '#fff',
                borderRadius: '20px',
                border: '1px solid var(--hair)',
                textAlign: 'center',
                boxShadow: '0 4px 30px rgba(0,0,0,0.015)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(209, 226, 49, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: 'var(--navy)'
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '38px', height: '38px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--navy)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                  No messages yet
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '400px', marginInline: 'auto', lineHeight: '1.6' }}>
                  Your inbox is completely clear! When visitors submit inquiries through the public Contact Form, they will be instantly routed to this panel.
                </p>
              </div>
            ) : (
              (() => {
                const activeMsg = contactMessages.find(m => m.id === activeMsgId) || contactMessages[0]
                const activeInitials = activeMsg?.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'S'
                return (
                  <div className="inbox-container">
                    {/* Left Pane: Message List */}
                    <div className="inbox-list-pane">
                      <div className="inbox-list-header">
                        <h3>Inbox ({contactMessages.filter(m => !m.is_read).length} Unread)</h3>
                      </div>
                      <div className="inbox-list-items">
                        {contactMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`inbox-card${msg.id === activeMsg?.id ? ' active' : ''}${!msg.is_read ? ' unread' : ''}`}
                            onClick={() => {
                              setActiveMsgId(msg.id)
                              if (!msg.is_read) {
                                handleToggleRead(msg.id, false) // Auto-mark read when clicked
                              }
                            }}
                          >
                            <div className="inbox-card-meta">
                              <span className="inbox-card-name">{msg.full_name}</span>
                              <span className="inbox-card-date">
                                {new Date(msg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                            <span className="inbox-card-reason">{msg.reason || 'General'}</span>
                            <div className="inbox-card-snippet">{msg.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Pane: Message Details Reader */}
                    <div className="inbox-reader-pane">
                      {activeMsg ? (
                        <>
                          <div className="inbox-reader-header">
                            <div className="inbox-sender-info">
                              <div className="inbox-avatar">{activeInitials}</div>
                              <div className="inbox-sender-details">
                                <h4>{activeMsg.full_name}</h4>
                                <div className="inbox-msg-date">
                                  Received {new Date(activeMsg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                            <div className="inbox-actions-top">
                              <button
                                onClick={() => handleToggleRead(activeMsg.id, activeMsg.is_read)}
                                className={`inbox-action-button ${activeMsg.is_read ? 'secondary' : 'primary'}`}
                              >
                                {activeMsg.is_read ? '✉️ Mark Unread' : '✓ Mark Read'}
                              </button>
                            </div>
                          </div>

                          <div className="inbox-reader-body">
                            <div className="inbox-meta-grid">
                              <div className="inbox-meta-item">
                                <span className="inbox-meta-label">Phone</span>
                                <span className="inbox-meta-value">
                                  <a href={`tel:${activeMsg.phone}`}>{activeMsg.phone}</a>
                                </span>
                              </div>
                              <div className="inbox-meta-item">
                                <span className="inbox-meta-label">Email</span>
                                <span className="inbox-meta-value">
                                  {activeMsg.email ? <a href={`mailto:${activeMsg.email}`}>{activeMsg.email}</a> : '—'}
                                </span>
                              </div>
                              <div className="inbox-meta-item">
                                <span className="inbox-meta-label">Reason for Contact</span>
                                <span className="inbox-meta-value" style={{ textTransform: 'capitalize' }}>
                                  {activeMsg.reason || 'General Enquiry'}
                                </span>
                              </div>
                            </div>

                            <div className="inbox-message-content">
                              {activeMsg.message}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                              <a
                                href={`https://wa.me/${activeMsg.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inbox-action-button primary"
                              >
                                💬 Reply on WhatsApp
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(activeMsg.message)
                                  alert('Message copied to clipboard!')
                                }}
                                className="inbox-action-button secondary"
                              >
                                📋 Copy Message
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="inbox-reader-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                          <p>Select a message from the list to view</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        )}

        {/* SETTINGS */}
        {currentView === 'settings' && (
          <div>
            <div className="topbar">
              <div><h1>Settings</h1><div className="sub">Admin-only. Branding, contact info, integrations.</div></div>
            </div>
            <div className="panel">
              <h3>Brand information</h3>
              <div className="sub">Updates here flow to the public website footer and contact pages.</div>
              <div className="field"><label>Brand name</label><input defaultValue="E-Vangariwala" /></div>
              <div className="field"><label>Tagline (Bangla)</label><input defaultValue="আপনার বর্জ্য, আমাদের দায়িত্ব" /></div>
              <div className="field"><label>HQ address</label><input defaultValue="Dakkhingoan 1 No. Road, Basaboo, Dhaka-1214" /></div>
              <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label>Phone</label><input defaultValue="01537-395293" /></div>
                <div><label>WhatsApp</label><input defaultValue="01759-251523" /></div>
              </div>
              <button className="pill lime" style={{ marginTop: 12 }}>Save changes</button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedPickup && (
        <div className="modal-backdrop" onClick={() => setSelectedPickup(null)}>
          <div className="modal-content ticket" onClick={e => e.stopPropagation()}>
            <button className="modal-close-abs" onClick={() => setSelectedPickup(null)}>✕</button>
            
            <div className="modal-hero">
              <span className={`badge ${STATUS_CLASS[selectedPickup.status] || ''}`}>{selectedPickup.status}</span>
              <h3>{selectedPickup.booking_ref}</h3>
              <div className="val">{selectedPickup.estimated_value ? `৳${Number(selectedPickup.estimated_value).toLocaleString()}` : '—'}</div>
              <div className="val-lbl">Estimated Scrap Value</div>
            </div>

            <div className="modal-split">
              <div className="split-col">
                <div className="sec-label">Customer</div>
                <div className="d-item">
                  <div className="d-lbl">Name</div>
                  <div className="d-val">{selectedPickup.customer_name}</div>
                </div>
                <div className="d-item">
                  <div className="d-lbl">Phone</div>
                  <div className="d-val">{selectedPickup.phone}</div>
                </div>
                <div className="d-item">
                  <div className="d-lbl">Address</div>
                  <div className="d-val">{selectedPickup.address}</div>
                  <div className="d-sub">{selectedPickup.area || '—'}</div>
                </div>
              </div>

              <div className="split-col alt">
                <div className="sec-label">Logistics</div>
                <div className="d-item">
                  <div className="d-lbl">Preferred Date</div>
                  <div className="d-val">{selectedPickup.created_at ? new Date(selectedPickup.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
                </div>
                <div className="d-item">
                  <div className="d-lbl">Scrap Types</div>
                  <div className="d-val">{(selectedPickup.scrap_types || []).join(', ') || '—'}</div>
                </div>
                <div className="d-item">
                  <div className="d-lbl">Assigned Crew</div>
                  <div className="d-val">{selectedPickup.assigned_crew || 'Unassigned'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewPostModal && (
        <div className="modal-backdrop" onClick={() => setShowNewPostModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>New Blog Post</h2>
              <button className="modal-close" onClick={() => setShowNewPostModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleNewPostSubmit}>
              <div className="field">
                <label>Title</label>
                <input required value={newPostForm.title} onChange={e => setNewPostForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="field">
                <label>Category</label>
                <select required value={newPostForm.category} onChange={e => setNewPostForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="industry">Industry</option>
                  <option value="ewaste">E-Waste</option>
                  <option value="income">Income</option>
                  <option value="guide">Guide</option>
                  <option value="office">Office</option>
                </select>
              </div>
              <div className="field">
                <label>Excerpt (optional)</label>
                <textarea rows={3} value={newPostForm.excerpt} onChange={e => setNewPostForm(f => ({ ...f, excerpt: e.target.value }))} />
              </div>
              <button type="submit" className="pill lime" disabled={submittingPost} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                {submittingPost ? 'Creating...' : 'Create Draft'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showNewPriceModal && (
        <div className="modal-backdrop" onClick={() => setShowNewPriceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Add New Scrap Item</h2>
              <button className="modal-close" onClick={() => setShowNewPriceModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleCreatePrice}>
              <div className="field">
                <label>Item Name (English)</label>
                <input required placeholder="e.g. Cardboard" value={newPriceForm.name} onChange={e => setNewPriceForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>Item Name (Bangla)</label>
                <input placeholder="e.g. পিচবোর্ড" value={newPriceForm.name_bn} onChange={e => setNewPriceForm(f => ({ ...f, name_bn: e.target.value }))} />
              </div>
              <div className="field">
                <label>Category</label>
                <select required value={newPriceForm.category} onChange={e => setNewPriceForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="paper">Paper</option>
                  <option value="plastic">Plastic</option>
                  <option value="metal">Metal</option>
                  <option value="electronics">Electronics</option>
                  <option value="appliances">Appliances</option>
                </select>
              </div>
              <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Price (৳)</label>
                  <input required type="number" step="0.01" placeholder="e.g. 15" value={newPriceForm.price} onChange={e => setNewPriceForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Unit</label>
                  <input required placeholder="e.g. kg or piece" value={newPriceForm.unit} onChange={e => setNewPriceForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="pill lime" disabled={submittingPrice} style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                {submittingPrice ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {editingPrice && (
        <div className="modal-backdrop" onClick={() => setEditingPrice(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Edit Scrap Item</h2>
              <button className="modal-close" onClick={() => setEditingPrice(null)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleUpdatePrice}>
              <div className="field">
                <label>Item Name (English)</label>
                <input required value={editingPrice.name} onChange={e => setEditingPrice(f => f ? ({ ...f, name: e.target.value }) : null)} />
              </div>
              <div className="field">
                <label>Item Name (Bangla)</label>
                <input value={editingPrice.name_bn || ''} onChange={e => setEditingPrice(f => f ? ({ ...f, name_bn: e.target.value }) : null)} />
              </div>
              <div className="field">
                <label>Category</label>
                <select required value={editingPrice.category} onChange={e => setEditingPrice(f => f ? ({ ...f, category: e.target.value }) : null)}>
                  <option value="paper">Paper</option>
                  <option value="plastic">Plastic</option>
                  <option value="metal">Metal</option>
                  <option value="electronics">Electronics</option>
                  <option value="appliances">Appliances</option>
                </select>
              </div>
              <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Price (৳)</label>
                  <input required type="number" step="0.01" value={editingPrice.price} onChange={e => setEditingPrice(f => f ? ({ ...f, price: Number(e.target.value) }) : null)} />
                </div>
                <div className="field">
                  <label>Unit</label>
                  <input required value={editingPrice.unit} onChange={e => setEditingPrice(f => f ? ({ ...f, unit: e.target.value }) : null)} />
                </div>
              </div>
              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="price_active"
                  checked={editingPrice.is_active}
                  onChange={e => setEditingPrice(f => f ? ({ ...f, is_active: e.target.checked }) : null)}
                  style={{ width: '16px', height: '16px', margin: 0 }}
                />
                <label htmlFor="price_active" style={{ fontSize: '13px', color: 'var(--navy)', userSelect: 'none', margin: 0, fontWeight: 500 }}>Active & visible on public list</label>
              </div>
              <button type="submit" className="pill lime" disabled={submittingPrice} style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                {submittingPrice ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
