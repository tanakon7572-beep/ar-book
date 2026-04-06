'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const login = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError('')
        const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
        if (res.ok) { router.push('/admin/shelves') }
        else { setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'); setLoading(false) }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Visual Header */}
                <div className="text-center mb-10 fade-up">
                    <div className="heart-pulse" style={{ fontSize: '5rem', marginBottom: '24px', display: 'inline-block' }}>❤️</div>
                    <h1 className="text-gradient" style={{ fontSize: '2.8rem', letterSpacing: '-0.02em', marginBottom: '8px' }}>Admin Login</h1>
                    <p style={{ color: 'var(--c-text-3)', fontSize: '0.95rem' }}>ยินดีต้อนรับสู่ระบบจัดการความทรงจำ</p>
                </div>

                {/* Login Glass Panel */}
                <div className="glass-panel fade-up" style={{ padding: '40px', animationDelay: '0.1s', border: '1px solid var(--c-border-h)' }}>
                    <form onSubmit={login} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', fontWeight: 600 }}>🔑 รหัสผ่านแอดมิน</label>
                            <input
                                className="input-premium"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="กรอกรหัสผ่านเพื่อจัดการเว็บไซต์..."
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="fade-up" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#ff8a8a', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ⚠️ <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '16px', fontSize: '1.05rem' }}>
                            {loading ? '⏳ กำลังวิเคราะห์หัวใจ...' : '🔐 เข้าสู่ระบบควบคุม'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-10 fade-up" style={{ animationDelay: '0.2s' }}>
                    <Link href="/shelf" style={{ color: 'var(--c-text-3)', textDecoration: 'none', fontSize: '0.9rem', borderBottom: '1px solid var(--c-border)', paddingBottom: '2px' }}>
                        ← กลับสู่หน้าหลักของร้าน
                    </Link>
                </div>
            </div>
        </div>
    )
}
