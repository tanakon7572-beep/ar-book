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
                padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--c-border)', background: 'linear-gradient(180deg, var(--c-surface), transparent)',
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                backdropFilter: 'blur(12px)',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }} className="fade-up">
                    <span className="heart-pulse" style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 15px var(--c-pink))' }}>❤️</span>
                    <div>
                        <div className="text-gradient" style={{ fontFamily: 'var(--f-serif)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {settings?.siteTitle || 'AR Photo Book'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', letterSpacing: '0.1em', marginTop: '3px', textTransform: 'uppercase' }}>Memory Collection</div>
                    </div>
                </Link>
                <div className="fade-up">
                    <Link href="/" className="btn btn-ghost" style={{ borderRadius: '30px', padding: '8px 20px', fontSize: '0.9rem' }}>📷 สแกน QR</Link>
                </div>
            </header>

            <main className="shelf-main">
                <div className="text-center fade-up shelf-hero" style={{ animationDelay: '0.2s', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <h1 className="text-gradient" style={{ marginBottom: '12px', fontWeight: 900, textShadow: '0 10px 40px rgba(255,0,128,0.3)' }}>
                        คลังความทรงจำ
                    </h1>
                    <p style={{ color: 'var(--c-text-2)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>เลือกเปิดหนังสือเพื่อย้อนดูเรื่องราวและความรู้สึกที่ถูกบันทึกไว้</p>
                </div>

                {loading ? (
                    <div className="text-center" style={{ padding: '80px 0' }}>
                        <div className="heart-pulse" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📚</div>
                        <p style={{ color: 'var(--c-text-3)', fontStyle: 'italic' }}>กำลังจัดเรียงหนังสือเข้าสู่ชั้นวาง...</p>
                    </div>
                ) : shelves.length === 0 ? (
                    <div className="glass-panel text-center fade-up" style={{ padding: '80px 40px', border: '1px solid var(--c-border)', borderRadius: '24px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🌵</div>
                        <h2 className="mb-4" style={{ color: 'var(--c-text-2)' }}>ยังไม่มีหนังสือในคลัง</h2>
                        <p style={{ color: 'var(--c-text-3)' }}>เมื่อคุณสร้างหนังสือในระบบจัดการ เล่มหนังสือจะมาปรากฏที่นี่</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                        {shelves.map((shelf, idx) => (
                            <div key={shelf.id} className="fade-up" style={{ animationDelay: `${idx * 0.1 + 0.3}s` }}>
                                {/* Shelf heading — ไม่มี ✦ แล้ว */}
                                <div className="shelf-heading">
                                    <h3 className="shelf-title">{shelf.name}</h3>
                                    <div className="shelf-divider" />
                                    <span className="shelf-count">{shelf.books.length} เล่ม</span>
                                </div>

                                {/* Book grid — responsive */}
                                <div className="book-grid">
                                    {shelf.books.length === 0 ? (
                                        <p style={{ color: 'var(--c-text-3)', fontStyle: 'italic', padding: '20px' }}>ยังไม่มีหนังสือถูกนำมาวางในชั้นนี้</p>
                                    ) : shelf.books.map((book, bIdx) => {
                                        const displayImage = book.coverImageUrl || book.pages?.[0]?.imageUrl
                                        return (
                                            <div
                                                key={book.id}
                                                className="public-book-card"
                                                style={{
                                                    animationDelay: `${bIdx * 0.08}s`,
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
                                                        <div className="book-overlay">
                                                            <div className="book-title">{book.title}</div>
                                                            {book.subtitle && <div className="book-subtitle">{book.subtitle}</div>}
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
                /* ── Layout ── */
                .shelf-main {
                    flex: 1;
                    padding-top: 100px;
                    padding-bottom: 80px;
                    max-width: 1400px;
                    margin: 0 auto;
                    width: 100%;
                    padding-left: clamp(16px, 5vw, 60px);
                    padding-right: clamp(16px, 5vw, 60px);
                    box-sizing: border-box;
                }
                .shelf-hero {
                    margin-bottom: clamp(32px, 6vw, 64px);
                }
                .shelf-hero h1 {
                    font-size: clamp(2.2rem, 6vw, 4.5rem);
                }
                .shelf-hero p {
                    font-size: clamp(0.95rem, 2vw, 1.15rem);
                }

                /* ── Shelf heading ── */
                .shelf-heading {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .shelf-title {
                    font-size: clamp(1.3rem, 3vw, 2rem);
                    color: var(--c-text);
                    font-weight: 800;
                    white-space: nowrap;
                    margin: 0;
                }
                .shelf-divider {
                    flex: 1;
                    height: 2px;
                    background: linear-gradient(90deg, var(--c-border), transparent);
                    min-width: 20px;
                }
                .shelf-count {
                    color: var(--c-pink);
                    font-weight: 700;
                    font-size: 0.85rem;
                    letter-spacing: 0.08em;
                    white-space: nowrap;
                }

                /* ── Responsive book grid ── */
                .book-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 200px));
                    gap: clamp(20px, 3vw, 40px);
                }

                /* ── Book card ── */
                .public-book-card {
                    aspect-ratio: 2 / 3;
                    width: 100%;
                    perspective: 1000px;
                    cursor: pointer;
                    border-radius: 4px 14px 14px 4px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.45), inset 2px 0 5px rgba(255,255,255,0.15);
                    transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1),
                                box-shadow 0.45s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                }
                .public-book-card:hover {
                    transform: translateY(-14px) scale(1.04) rotateY(-4deg);
                    box-shadow: 0 28px 55px rgba(0,0,0,0.7), 0 0 35px rgba(255,0,128,0.25);
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
                    top: 0; left: 0; bottom: 0;
                    width: 12px;
                    background: linear-gradient(90deg, rgba(0,0,0,0.55), rgba(255,255,255,0.08), transparent);
                    z-index: 10;
                }
                .public-book-spine {
                    position: absolute;
                    width: 28px;
                    height: 100%;
                    left: 0;
                    transform: translateX(-28px) translateZ(-14px) rotateY(-90deg);
                    transform-origin: right center;
                    border-radius: 4px 0 0 4px;
                    box-shadow: inset -2px 0 5px rgba(0,0,0,0.45);
                }

                /* ── Book overlay text ── */
                .book-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.92) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: clamp(12px, 3%, 20px);
                }
                .book-title {
                    font-family: var(--f-serif);
                    font-size: clamp(0.95rem, 2vw, 1.3rem);
                    font-weight: 800;
                    color: #fff;
                    text-shadow: 0 3px 10px rgba(0,0,0,0.9);
                    line-height: 1.25;
                }
                .book-subtitle {
                    font-size: clamp(0.7rem, 1.5vw, 0.82rem);
                    color: rgba(255,200,230,0.88);
                    margin-top: 6px;
                    line-height: 1.35;
                }

                /* ── Mobile tweaks ── */
                @media (max-width: 600px) {
                    .book-grid {
                        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                        gap: 16px;
                    }
                    .public-book-spine { display: none; }
                    .shelf-heading { gap: 12px; }
                }
                @media (max-width: 400px) {
                    .book-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    )
}
