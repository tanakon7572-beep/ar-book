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
        { name: 'จัดการชั้นหนังสือ', path: '/admin/shelves', icon: '📚' },
        { name: 'ตั้งค่าธีมสุดพรีเมียม', path: '/admin/settings', icon: '✨' },
        { name: 'เปิดดูหน้าสาธารณะ', path: '/shelf', isExternal: true, icon: '🌍' },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
            {/* Sidebar Desktop */}
            <aside className="admin-sidebar" style={{
                width: '320px', flexShrink: 0, padding: '50px 24px',
                display: 'flex', flexDirection: 'column',
                background: 'rgba(5, 0, 10, 0.4)',
                backdropFilter: 'blur(60px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '20px 0 60px rgba(0,0,0,0.6)', zIndex: 10,
                position: 'relative'
            }}>
                {/* Decorative Ambient Glows */}
                <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--c-pink)', opacity: 0.1, filter: 'blur(80px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '100px', right: '-20px', width: '100px', height: '100px', background: 'var(--c-pink)', opacity: 0.05, filter: 'blur(60px)', pointerEvents: 'none' }} />

                <div style={{ marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '20px', paddingLeft: '16px' }}>
                    <div className="heart-pulse-logo" style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 15px var(--c-pink))' }}>💖</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>AR BOOK</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: '6px' }}>Master Control</div>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontWeight: 900, letterSpacing: '0.3em', marginBottom: '24px', paddingLeft: '20px', textTransform: 'uppercase' }}>Navigation</div>
                    {navItems.map(item => {
                        const isActive = pathname.startsWith(item.path) && !item.isExternal
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                target={item.isExternal ? '_blank' : undefined}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                <span className="sidebar-text">{item.name}</span>
                                {isActive && <div className="active-indicator" />}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                    <button onClick={logout} className="sidebar-link-logout" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderRadius: '18px', transition: '0.4s' }}>
                        <span style={{ fontSize: '1.3rem' }}>🚪</span>
                        <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}>ออกจากระบบ</div>
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', fontWeight: 700 }}>VER 2.1.0 • LUXURY EDITION</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '60px' }} className="admin-content-area">
                    <div className="max-w-7xl" style={{ margin: '0 auto', width: '100%' }}>
                        {children}
                    </div>
                </div>
            </main>

            <style jsx>{`
        .heart-pulse-logo {
          animation: logo-pulse 3s infinite ease-in-out;
        }
        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px var(--c-pink)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 25px var(--c-pink)); }
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 18px 24px;
          border-radius: 22px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          border: 1px solid transparent;
          background: transparent;
          position: relative;
          overflow: hidden;
        }
        .sidebar-icon {
          font-size: 1.4rem;
          margin-right: 18px;
          transition: transform 0.4s ease;
          z-index: 2;
        }
        .sidebar-text {
          z-index: 2;
          transition: color 0.4s ease;
        }
        
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          transform: translateX(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .sidebar-link:hover .sidebar-icon {
          transform: scale(1.2) rotate(-5deg);
        }

        .sidebar-link.active {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          border: 1px solid rgba(255, 0, 128, 0.4);
          box-shadow: 0 15px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,0,128,0.1);
        }
        .sidebar-link.active .sidebar-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 10px var(--c-pink));
        }
        
        .active-indicator {
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 4px;
          background: var(--c-pink);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 15px var(--c-pink);
        }

        .sidebar-link-logout {
          background: rgba(255, 77, 77, 0.03);
          border: 1px solid transparent;
          color: rgba(255, 77, 77, 0.5);
          cursor: pointer;
        }
        .sidebar-link-logout:hover {
          background: rgba(255, 77, 77, 0.15);
          color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 77, 77, 0.1);
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none !important;
          }
          .admin-content-area {
            padding: 30px !important;
          }
        }
      `}</style>
        </div>
    )
}
