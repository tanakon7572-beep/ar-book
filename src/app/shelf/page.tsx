'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Page = { imageUrl: string | null }
type Book = { id: number; title: string; subtitle?: string | null; coverColor: string; spineColor?: string; coverImageUrl?: string | null; qrToken: string; order: number; pages?: Page[] }
type Shelf = { id: number; name: string; order: number; books: Book[] }
type Settings = { siteTitle: string }

export default function ShelfPage() {
    const [shelves, setShelves] = useState<Shelf[]>([])
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        Promise.all([
            fetch('/api/shelves').then(r => r.json()),
            fetch('/api/settings').then(r => r.json())
        ])
            .then(([s, cfg]) => { setShelves(s); setSettings(cfg); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(0,0,0,0.8), transparent)',
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }} className="fade-up">
                    <span className="heart-pulse" style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 15px var(--c-pink))' }}>❤️</span>
                    <div>
                        <div className="text-gradient" style={{ fontFamily: 'var(--f-serif)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {settings?.siteTitle || 'AR Photo Book'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', letterSpacing: '0.1em', marginTop: '4px', textTransform: 'uppercase' }}>Memory Collection</div>
                    </div>
                </Link>
                <div style={{ display: 'flex', gap: '16px', animationDelay: '0.1s' }} className="fade-up">
                    <Link href="/" className="btn btn-ghost" style={{ borderRadius: '30px', padding: '10px 24px' }}>📷 เข้าสู่โหมดสแกน</Link>
                </div>
            </header>

            <main style={{ flex: 1, paddingTop: '140px', paddingBottom: '100px', maxWidth: '1400px', margin: '0 auto', width: '100%', paddingLeft: '40px', paddingRight: '40px' }}>
                <div className="text-center mb-16 fade-up" style={{ animationDelay: '0.2s', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'var(--g-pink)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <h1 className="text-gradient" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '16px', fontWeight: 900, textShadow: '0 10px 40px rgba(255,0,128,0.3)' }}>
                        คลังความทรงจำ
                    </h1>
                    <p style={{ color: 'var(--c-text-2)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>เลือกเปิดหนังสือเพื่อย้อนดูเรื่องราวและความรู้สึกที่ถูกบันทึกไว้ในทุกช่วงเวลาสำคัญของเรา</p>
                </div>

                {loading ? (
                    <div className="text-center" style={{ padding: '120px' }}>
                        <div className="heart-pulse" style={{ fontSize: '4rem', marginBottom: '24px' }}>📚</div>
                        <p style={{ color: 'var(--c-text-3)', fontStyle: 'italic', fontSize: '1.2rem' }}>กำลังจัดเรียงหนังสือเข้าสู่ชั้นวาง...</p>
                    </div>
                ) : shelves.length === 0 ? (
                    <div className="glass-panel text-center fade-up" style={{ padding: '120px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.5 }}>🌵</div>
                        <h2 className="mb-4" style={{ fontSize: '2rem', color: 'var(--c-text-2)' }}>ยังไม่มีหนังสือในคลัง</h2>
                        <p style={{ color: 'var(--c-text-3)', marginBottom: '32px' }}>เมื่อคุณสร้างหนังสือในระบบจัดการ เล่มหนังสือจะมาปรากฏที่นี่</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                        {shelves.map((shelf, idx) => (
                            <div key={shelf.id} className="fade-up" style={{ animationDelay: `${idx * 0.1 + 0.3}s` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                                    <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, letterSpacing: '0.02em', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>✦ {shelf.name}</h3>
                                    <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
                                    <span style={{ color: 'var(--c-pink)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em' }}>{shelf.books.length} เล่ม</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                                    {shelf.books.length === 0 ? (
                                        <p style={{ color: 'var(--c-text-3)', fontStyle: 'italic', padding: '20px' }}>ยังไม่มีหนังสือถูกนำมาวางในชั้นนี้</p>
                                    ) : shelf.books.map((book, bIdx) => {
                                        const displayImage = book.coverImageUrl || book.pages?.[0]?.imageUrl
                                        return (
                                            <div
                                                key={book.id}
                                                className="public-book-card"
                                                style={{
                                                    animationDelay: `${bIdx * 0.1}s`,
                                                    background: displayImage ? '#000' : `linear-gradient(145deg, ${book.coverColor}, #1a001a)`
                                                }}
                                                onClick={() => router.push(`/book/${book.qrToken}`)}
                                            >
                                                <div className="public-book-perspective">
                                                    <div className="public-book-spine" style={{ background: book.spineColor || '#222' }} />
                                                    <div className="public-book-front">
                                                        {displayImage ? (
                                                            <img src={displayImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>❤️</span>
                                                            </div>
                                                        )}
                                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.95) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
                                                            <div style={{ fontFamily: 'var(--f-serif)', fontSize: '1.4rem', fontWeight: 800, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.9)', lineHeight: 1.2 }}>{book.title}</div>
                                                            {book.subtitle && <div style={{ fontSize: '0.85rem', color: 'rgba(255,200,230,0.9)', marginTop: '8px', lineHeight: 1.4 }}>{book.subtitle}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style jsx global>{`
                .public-book-card {
                    width: 220px;
                    height: 330px;
                    perspective: 1000px;
                    cursor: pointer;
                    border-radius: 4px 16px 16px 4px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 2px 0 5px rgba(255,255,255,0.2);
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .public-book-card:hover {
                    transform: translateY(-20px) scale(1.05) rotateY(-5deg);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,0,128,0.3);
                }

                .public-book-perspective {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    border-radius: inherit;
                }

                .public-book-front {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    backface-visibility: hidden;
                    border-radius: inherit;
                    overflow: hidden;
                    z-index: 2;
                }

                .public-book-front::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    width: 12px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.6), rgba(255,255,255,0.1), transparent);
                    z-index: 10;
                }

                .public-book-spine {
                    position: absolute;
                    width: 30px;
                    height: 100%;
                    left: 0;
                    transform: translateX(-30px) translateZ(-15px) rotateY(-90deg);
                    transform-origin: right center;
                    border-radius: 4px 0 0 4px;
                    box-shadow: inset -2px 0 5px rgba(0,0,0,0.5);
                }

                @media (max-width: 768px) {
                    .public-book-card { width: 160px; height: 240px; }
                    .public-book-spine { display: none; }
                }
            `}</style>
        </div>
    )
}
