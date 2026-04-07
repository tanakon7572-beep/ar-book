'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
        
        // Setup state BEFORE animation visually runs
        // We set flipping to begin the CSS animation
        setFlipping(dir)
        
        // Wait for CSS animation to finish
        setTimeout(() => {
            setCurrentSpread(s => dir === 'next' ? s + 1 : s - 1)
            setFlipping(null)
        }, 1150) // Almost exactly matching the 1.2s duration
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
            return (
                <div style={{ height: '100%', background: '#050008', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)', borderRadius: side === 'left' ? '6px 0 0 6px' : '0 10px 10px 0' }} />
            )
        }

        return (
            <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden', background: '#0a0508' }}>
                {page.imageUrl ? (
                    /* The user specifically asked for "FULL PAGE" (รูปเต็มหน้ากระดาษเลย) */
                    page.imageUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                        <video
                            src={page.imageUrl}
                            autoPlay loop muted playsInline
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#050008', zIndex: 1 }}
                        />
                    ) : (
                        <Image
                            src={page.imageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: 'cover', backgroundColor: '#050008', zIndex: 1 }}
                        />
                    )
                ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #111 0%, #000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.03)', fontSize: '8rem', boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8)' }}>🌸</div>
                )}

                {/* 3. Text Overlay - Pill Style like Page Number */}
                {(page.text || page.caption) && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px', zIndex: 10, alignItems: 'center' }}>
                        <div className="liquid-glass-overlay" style={{ textAlign: 'center', width: 'fit-content', maxWidth: '90%' }}>
                            {page.text && <p style={{ fontSize: '1.1rem', fontFamily: 'var(--f-sans)', lineHeight: 1.4, marginBottom: page.caption ? '4px' : '0', color: 'rgba(255,255,255,0.95)' }}>{page.text}</p>}
                            {page.caption && <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', fontWeight: 700 }}>{page.caption}</p>}
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

    // Determines if visually we are at the front cover (either resting or arriving)
    const isFrontCoverVisible = currentSpread === 0 && flipping !== 'next' || (currentSpread === 1 && flipping === 'prev');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="viewer-header">
                <button onClick={() => router.push('/shelf')} className="btn btn-ghost viewer-header-btn" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px' }}>
                    <span className="hide-mobile">← คลังความทรงจำ</span>
                    <span className="show-mobile">← กลับ</span>
                </button>
                <div className="viewer-header-title" style={{ textAlign: 'center' }}>
                    <h1 className="text-gradient" style={{ fontFamily: 'var(--f-serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '2px', letterSpacing: '-0.02em' }}>{book?.title}</h1>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>{book?.shelf?.name}</p>
                </div>
                <Link href="/" className="btn btn-primary viewer-header-btn" style={{ padding: '10px 16px', boxShadow: '0 10px 30px rgba(255,0,128,0.3)' }}>
                    <span className="hide-mobile">📸 สแกนใหม่</span>
                    <span className="show-mobile">📸 สแกน</span>
                </Link>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '60px' }}>

                {/* We apply the transform to inner to prevent fadeUp animation overwrite */}
                <div className="book-spread-container fade-up" style={{ borderRadius: '0 20px 20px 0' }}>
                    <div className="book-spread-inner" style={{ transform: isFrontCoverVisible ? 'translateX(-25%)' : 'translateX(0)', transition: 'transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)' }}>
                        {/* STATIC LEFT PAGE: Shows what is/will be on the left. Hidden on front cover so it looks like a closed book. */}
                        <div className="book-page book-page-left" style={{ opacity: isFrontCoverVisible ? 0 : 1, transition: 'opacity 1.2s', pointerEvents: isFrontCoverVisible ? 'none' : 'auto' }}>
                            <div className="page-decoration" style={{ zIndex: 20 }} />
                            <PageContent page={flipping === 'prev' ? pages[(currentSpread - 2) * 2] || null : leftPage} side="left" />
                        </div>

                        {/* STATIC RIGHT PAGE: Shows what is/will be on the right */}
                        <div className="book-page book-page-right">
                            <div className="page-decoration" style={{ zIndex: 20 }} />
                            <PageContent page={flipping === 'next' ? pages[(currentSpread) * 2 + 1] || null : rightPage} side="right" />
                        </div>

                        {/* FLIPPING PAGE LAYER (Only visible during animation) */}
                        {flipping === 'next' && (
                            <div className="flipper-layer next">
                                <div className="flipper-front book-page">
                                    <div className="page-decoration" />
                                    {/* The old right page that turns over */}
                                    {currentSpread === 0 ? (
                                        <div style={{
                                            height: '100%', width: '100%', position: 'relative', overflow: 'hidden',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px', gap: '20px',
                                        }}>
                                            {book?.coverImageUrl ? (
                                                book.coverImageUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                                                    <video src={book.coverImageUrl} autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#050008', zIndex: 0 }} />
                                                ) : (
                                                    <Image src={book.coverImageUrl} alt="Cover" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', zIndex: 0 }} priority />
                                                )
                                            ) : (
                                                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${book?.coverColor}, #050008)`, zIndex: 0 }} />
                                            )}
                                            {book?.coverImageUrl && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 1 }} />}
                                            <div className="heart-pulse" style={{ fontSize: '6rem', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 30px var(--c-pink))' }}>❤️</div>
                                            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                                <h1 style={{ fontSize: '3rem', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.9)', fontWeight: 900, fontFamily: 'var(--f-serif)', lineHeight: 1.1 }}>{book?.title}</h1>
                                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginTop: '20px', fontStyle: 'italic', fontFamily: 'var(--f-serif)', letterSpacing: '0.02em', textShadow: '0 2px 15px rgba(0,0,0,0.6)' }}>
                                                    {book?.subtitle || 'เก็บความรู้สึกดีๆ ไว้ตลอดไป...'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <PageContent page={rightPage} side="right" />
                                    )}
                                </div>
                                <div className="flipper-back book-page">
                                    <div className="page-decoration" />
                                    {/* The new left page that gets revealed */}
                                    <PageContent page={pages[(currentSpread) * 2]} side="left" />
                                </div>
                            </div>
                        )}

                        {flipping === 'prev' && (
                            <div className="flipper-layer prev">
                                <div className="flipper-front book-page" style={{ transform: 'rotateY(180deg)' }}>
                                    <div className="page-decoration" />
                                    {/* The old left page that turns over */}
                                    <PageContent page={leftPage} side="left" />
                                </div>
                                <div className="flipper-back book-page" style={{ transform: 'rotateY(0deg)' }}>
                                    <div className="page-decoration" />
                                    {/* The new right page that gets revealed */}
                                    {currentSpread - 1 === 0 ? (
                                        <div style={{
                                            height: '100%', width: '100%', position: 'relative', overflow: 'hidden',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px', gap: '20px',
                                        }}>
                                            {book?.coverImageUrl ? (
                                                book.coverImageUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                                                    <video src={book.coverImageUrl} autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#050008', zIndex: 0 }} />
                                                ) : (
                                                    <Image src={book.coverImageUrl} alt="Cover" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', zIndex: 0 }} priority />
                                                )
                                            ) : (
                                                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${book?.coverColor}, #050008)`, zIndex: 0 }} />
                                            )}
                                            {book?.coverImageUrl && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 1 }} />}
                                            <div className="heart-pulse" style={{ fontSize: '6rem', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 30px var(--c-pink))' }}>❤️</div>
                                            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                                <h1 style={{ fontSize: '3rem', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.9)', fontWeight: 900, fontFamily: 'var(--f-serif)', lineHeight: 1.1 }}>{book?.title}</h1>
                                            </div>
                                        </div>
                                    ) : (
                                        <PageContent page={pages[(currentSpread - 2) * 2 + 1] || null} side="right" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Default Front Cover logic on resting spread */}
                        {!flipping && currentSpread === 0 && (
                            <div className="book-page book-page-right" style={{ position: 'absolute', right: 0, top: 0, zIndex: 30 }}>
                                <div style={{
                                    height: '100%', width: '100%', position: 'relative', overflow: 'hidden',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px', gap: '20px',
                                }}>
                                    {/* Cover Image logic with absolute full coverage */}
                                    {book?.coverImageUrl ? (
                                        book.coverImageUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                                            <video src={book.coverImageUrl} autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#050008', zIndex: 0 }} />
                                        ) : (
                                            <Image src={book.coverImageUrl} alt="Cover" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', zIndex: 0 }} priority />
                                        )
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(155deg, ${book?.coverColor}, #050008)`, zIndex: 0 }} />
                                    )}
                                    {book?.coverImageUrl && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 1 }} />
                                    )}
                                    <div className="heart-pulse" style={{ fontSize: '6rem', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 0 30px var(--c-pink))' }}>❤️</div>
                                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                        <h1 style={{ fontSize: '3rem', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.9)', fontWeight: 900, fontFamily: 'var(--f-serif)', lineHeight: 1.1 }}>{book?.title}</h1>
                                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginTop: '20px', fontStyle: 'italic', fontFamily: 'var(--f-serif)', letterSpacing: '0.02em', textShadow: '0 2px 15px rgba(0,0,0,0.6)' }}>
                                            {book?.subtitle || 'เก็บความรู้สึกดีๆ ไว้ตลอดไป...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls - Refined UI */}
                <div className="flip-controls fade-up" style={{ animationDelay: '0.2s', marginTop: 'clamp(20px, 5vh, 70px)', background: 'rgba(255,255,255,0.02)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                    <button className="flip-btn" onClick={() => flip('prev')} disabled={isFirstSpread || !!flipping}>←</button>
                    <div style={{ textAlign: 'center', minWidth: '140px', flex: 1 }}>
                        <div style={{ color: 'var(--c-pink)', fontWeight: 900, fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', letterSpacing: '0.1em' }}>
                            {currentSpread === 0 ? 'COVER' : `CHAPTER ${currentSpread}`}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                            {currentSpread === 0 ? 'FRONT COVER' : `SPREAD ${currentSpread}`}
                        </div>
                    </div>
                    <button className="flip-btn" onClick={() => flip('next')} disabled={isLastSpread || !!flipping}>→</button>
                </div>

                {/* Thumbnails - Premium Track */}
                {pages.length > 0 && (
                    <div className="thumb-strip fade-up" style={{ animationDelay: '0.3s', marginTop: 'clamp(16px, 4vh, 60px)', background: 'rgba(0,0,0,0.3)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
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
                                    {p.imageUrl ? <Image src={p.imageUrl} alt="" fill sizes="100px" style={{ objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>📄</div>}
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
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    padding: 8px 16px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transform: translateY(0);
                    transition: all 0.4s ease;
                    margin-bottom: 30px;
                }
                .liquid-glass-overlay:hover {
                    background: rgba(0, 0, 0, 0.6);
                    transform: translateY(-2px);
                }
                .show-mobile { display: none; }
                @media (max-width: 600px) {
                    .hide-mobile { display: none; }
                    .show-mobile { display: inline; }
                }
            `}</style>
        </div>
    )
}
