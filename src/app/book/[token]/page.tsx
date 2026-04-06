'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Page = {
    id: number; order: number; imageUrl: string | null; text: string | null; caption: string | null
}

type Book = {
    id: number; title: string; subtitle?: string | null; coverColor: string; coverImageUrl?: string | null; qrToken: string; shelf: { name: string }; pages: Page[]
}

export default function BookViewerPage() {
    const { token } = useParams() as { token: string }
    const router = useRouter()
    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [currentSpread, setCurrentSpread] = useState(0)
    const [flipping, setFlipping] = useState<'next' | 'prev' | null>(null)

    useEffect(() => {
        fetch(`/api/scan/${token}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => { setBook(data); setLoading(false) })
            .catch(() => { setNotFound(true); setLoading(false) })
    }, [token])

    const pages = book?.pages || []
    const totalSpreads = Math.ceil(pages.length / 2) + 1
    const isFirstSpread = currentSpread === 0
    const isLastSpread = currentSpread >= totalSpreads - 1

    const flip = useCallback((dir: 'next' | 'prev') => {
        if (flipping) return
        setFlipping(dir)
        setTimeout(() => {
            setCurrentSpread(s => dir === 'next' ? s + 1 : s - 1)
            setFlipping(null)
        }, 600)
    }, [flipping])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && !isLastSpread) flip('next')
            if (e.key === 'ArrowLeft' && !isFirstSpread) flip('prev')
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [flip, isFirstSpread, isLastSpread])

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}>
            <div style={{ fontSize: '4.5rem' }} className="heart-pulse">📖</div>
            <p style={{ color: 'var(--c-text-2)', fontSize: '1.2rem', fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>กำลังเปิดกล่องความจำของคุณ...</p>
        </div>
    )

    if (notFound) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <div style={{ fontSize: '5rem' }}>🌸</div>
            <h2 className="text-gradient" style={{ fontSize: '2.2rem' }}>ไม่พบอัลบั้มนี้ในระบบ</h2>
            <Link href="/shelf" className="btn btn-primary">กลับไปดูที่ชั้นหนังสือ</Link>
        </div>
    )

    const leftPage = currentSpread === 0 ? null : pages[(currentSpread - 1) * 2] || null
    const rightPage = currentSpread === 0 ? null : pages[(currentSpread - 1) * 2 + 1] || null

    const PageContent = ({ page, side }: { page: Page | null, side: 'left' | 'right' }) => {
        if (!page) {
            return (side === 'right' ? (
                <div style={{ height: '100%', background: '#fff9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                    <div className="text-center" style={{ animation: 'fadeIn 1s' }}>
                        <div className="heart-pulse" style={{ fontSize: '4rem', marginBottom: '20px' }}>❤️</div>
                        <p style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontSize: '1.3rem', color: '#d0a0b8' }}>เก็บความรู้สึกดีๆ ไว้ตลอดไป...</p>
                    </div>
                </div>
            ) : (
                <div style={{ height: '100%', background: '#fff9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                    <div style={{ textAlign: 'center', opacity: 0.1 }}>
                        <div style={{ fontSize: '6rem', marginBottom: '20px' }}>❤️</div>
                        <h2 style={{ fontFamily: 'var(--f-serif)', fontStyle: 'italic', color: '#000', fontSize: '1.5rem' }}>AR Photo Book</h2>
                    </div>
                </div>
            ))
        }

        return (
            <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden', background: '#000', animation: 'fadeIn 0.6s' }}>
                {page.imageUrl ? (
                    /* The user specifically asked for "FULL PAGE" (รูปเต็มหน้ากระดาษเลย) */
                    <img
                        src={page.imageUrl}
                        alt=""
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover', zIndex: 1
                        }}
                    />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>📸</div>
                )}

                {/* 3. Liquid Glass Text Overlay - Floating prominently as requested */}
                {(page.text || page.caption) && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px', zIndex: 10 }}>
                        <div className="liquid-glass-overlay">
                            {page.text && <p style={{ fontSize: '1.35rem', fontFamily: 'var(--f-serif)', fontStyle: 'italic', lineHeight: 1.4, marginBottom: page.caption ? '14px' : '0', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{page.text}</p>}
                            {page.caption && <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', fontWeight: 600 }}>{page.caption}</p>}
                        </div>
                    </div>
                )}

                {/* Page Number with high visibility floating badge */}
                <div style={{
                    position: 'absolute', bottom: '25px', [side === 'left' ? 'left' : 'right']: '25px',
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 900, zIndex: 15,
                    background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '30px',
                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    P. {(currentSpread - 1) * 2 + (side === 'left' ? 1 : 2)}
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent)',
                backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            }}>
                <button onClick={() => router.push('/shelf')} className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '10px 24px' }}>
                    ← คลังความทรงจำ
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="text-gradient" style={{ fontFamily: 'var(--f-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '2px', letterSpacing: '-0.02em' }}>{book?.title}</h1>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>{book?.shelf?.name}</p>
                </div>
                <Link href="/" className="btn btn-primary" style={{ padding: '10px 28px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(255,0,128,0.3)' }}>📸 สแกนใหม่</Link>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '60px' }}>

                <div className="book-spread-container fade-up" style={{ boxShadow: '0 60px 120px rgba(0,0,0,0.8)', borderRadius: '0 20px 20px 0' }}>
                    <div className={`book-spread-inner ${flipping === 'next' ? 'page-flip-next' : flipping === 'prev' ? 'page-flip-prev' : ''}`}>

                        {/* LEFT PAGE */}
                        <div className="book-page book-page-left">
                            <div className="page-decoration" style={{ zIndex: 20 }} />
                            <PageContent page={leftPage} side="left" />
                        </div>

                        {/* RIGHT PAGE */}
                        <div className="book-page book-page-right">
                            <div className="page-decoration" style={{ zIndex: 20 }} />
                            {currentSpread === 0 ? (
                                <div style={{
                                    height: '100%', width: '100%', position: 'relative', overflow: 'hidden',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px', gap: '20px',
                                }}>
                                    {/* Cover Image logic with absolute full coverage */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: book?.coverImageUrl ? `url(${book.coverImageUrl}) center/cover` : `linear-gradient(155deg, ${book?.coverColor}, #050008)`
                                    }} />
                                    {book?.coverImageUrl && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 1 }} />
                                    )}
                                    <div className="heart-pulse" style={{ fontSize: '6rem', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 30px var(--c-pink))' }}>❤️</div>
                                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                        <h1 style={{ fontSize: '3rem', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.9)', fontWeight: 900, fontFamily: 'var(--f-serif)', lineHeight: 1.1 }}>{book?.title}</h1>
                                        {book?.subtitle && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.25rem', marginTop: '20px', fontStyle: 'italic', fontFamily: 'var(--f-serif)', letterSpacing: '0.02em', textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}>{book.subtitle}</p>}
                                    </div>
                                </div>
                            ) : (
                                <PageContent page={rightPage} side="right" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls - Refined UI */}
                <div className="flip-controls fade-up" style={{ animationDelay: '0.2s', marginTop: '70px', background: 'rgba(255,255,255,0.02)', padding: '16px 40px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <button className="flip-btn" onClick={() => flip('prev')} disabled={isFirstSpread || !!flipping}>←</button>
                    <div style={{ textAlign: 'center', minWidth: '180px' }}>
                        <div style={{ color: 'var(--c-pink)', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.2em' }}>
                            {currentSpread === 0 ? 'COVER' : `CHAPTER ${currentSpread}`}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
                            {currentSpread === 0 ? 'FRONT COVER' : `SPREAD ${currentSpread}`}
                        </div>
                    </div>
                    <button className="flip-btn" onClick={() => flip('next')} disabled={isLastSpread || !!flipping}>→</button>
                </div>

                {/* Thumbnails - Premium Track */}
                {pages.length > 0 && (
                    <div className="thumb-strip fade-up" style={{ animationDelay: '0.3s', marginTop: '60px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div
                            className={`thumb-item${currentSpread === 0 ? ' active' : ''}`}
                            onClick={() => { if (!flipping) setCurrentSpread(0) }}
                            style={{ background: 'var(--g-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: currentSpread === 0 ? '0 0 30px var(--c-pink)' : 'none' }}
                        >❤️</div>
                        {pages.map((p, i) => {
                            const sIdx = Math.floor(i / 2) + 1
                            if (i % 2 !== 0) return null
                            return (
                                <div
                                    key={p.id}
                                    className={`thumb-item${currentSpread === sIdx ? ' active' : ''}`}
                                    onClick={() => { if (!flipping) setCurrentSpread(sIdx) }}
                                >
                                    {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ objectFit: 'cover' }} /> : <div style={{ height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .liquid-glass-overlay {
                    background: rgba(10, 0, 15, 0.25);
                    backdrop-filter: blur(35px);
                    -webkit-backdrop-filter: blur(35px);
                    padding: 35px;
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 30px 80px rgba(0,0,0,0.7), inset 0 0 25px rgba(255,255,255,0.05);
                    transform: translateY(0);
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }
                .liquid-glass-overlay:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateY(-12px) scale(1.02);
                    border-color: rgba(255, 255, 255, 0.4);
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 30px rgba(255,0,128,0.2);
                }
            `}</style>
        </div>
    )
}
