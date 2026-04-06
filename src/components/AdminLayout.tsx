'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const navItems = [
    { name: 'จัดการชั้น', path: '/admin/shelves', icon: '📚' },
    { name: 'ตั้งค่าธีม', path: '/admin/settings', icon: '✨' },
    { name: 'หน้าดูสาธารณะ', path: '/shelf', isExternal: true, icon: '🌍' },
  ]

  return (
    <div className="admin-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent' }}>
      {/* Top Bar Navigation */}
      <header className="admin-topbar" style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'var(--g-glass)',
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid var(--c-border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
      }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '300px', height: '100px', background: 'var(--c-pink)', opacity: 0.15, filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Logo Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, flexShrink: 0 }}>
          <div className="heart-pulse-logo" style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 15px var(--c-pink))' }}>💖</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>AR BOOK</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--c-text-3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '2px' }}>Control</div>
          </div>
        </div>

        {/* Desktop/Tablet Navigation */}
        <nav className="topbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.path) && !item.isExternal
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`topbar-link ${isActive ? 'active' : ''}`}
                target={item.isExternal ? '_blank' : undefined}
              >
                <span className="topbar-icon">{item.icon}</span>
                <span className="topbar-text">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1, flexShrink: 0 }} className="topbar-actions">
          <span className="version-badge">VER 3.0</span>
          <button onClick={logout} className="topbar-link-logout" title="ออกจากระบบ">
            <span style={{ fontSize: '1.2rem' }}>🚪</span>
            <span className="logout-text">ออก</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation (Stacked below header on very small screens) */}
      <nav className="mobile-nav-bottom" style={{
        display: 'none', background: 'var(--g-glass)', backdropFilter: 'blur(30px)',
        borderBottom: '1px solid var(--c-border)', padding: '12px 16px', gap: '8px',
        overflowX: 'auto', whiteSpace: 'nowrap'
      }}>
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.path) && !item.isExternal
          return (
            <Link key={item.path} href={item.path} className={`topbar-link ${isActive ? 'active' : ''}`} target={item.isExternal ? '_blank' : undefined} style={{ flexShrink: 0 }}>
              <span className="topbar-icon" style={{ marginRight: '6px' }}>{item.icon}</span>
              <span className="topbar-text" style={{ fontSize: '0.85rem' }}>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <div className="max-w-7xl" style={{ margin: '0 auto', width: '100%', flex: 1 }}>
          {children}
        </div>
      </main>

    </div>
  )
}
