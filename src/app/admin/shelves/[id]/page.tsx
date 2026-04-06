'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import ConfirmModal from '@/components/ConfirmModal'

type Book = {
    id: number; title: string; subtitle?: string | null
    coverColor: string; spineColor: string; coverImageUrl?: string | null
    qrToken: string; order: number
}
type Shelf = { id: number; name: string; books: Book[] }

export default function ShelfDetailPage() {
    const { id } = useParams() as { id: string }
    const router = useRouter()
    const [shelf, setShelf] = useState<Shelf | null>(null)
    const [shelves, setShelves] = useState<{ id: number; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [newBook, setNewBook] = useState({ title: '', subtitle: '', coverColor: '#ff0080', spineColor: '#300010' })
    const [addingBook, setAddingBook] = useState(false)
    const [editingBook, setEditingBook] = useState<{ id: number; title: string; subtitle: string; coverColor: string } | null>(null)
    const [uploadingCoverId, setUploadingCoverId] = useState<number | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [deleteModalId, setDeleteModalId] = useState<number | null>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)
    const coverBookIdRef = useRef<number | null>(null)

    const load = async () => {
        const [shelfRes, allRes] = await Promise.all([
            fetch(`/api/shelves/${id}`),
            fetch('/api/shelves'),
        ])
        if (shelfRes.status === 401) { router.push('/admin'); return }
        if (!shelfRes.ok) { router.push('/admin/shelves'); return }
        setShelf(await shelfRes.json())
        const all = await allRes.json()
        setShelves(all.map((s: Shelf) => ({ id: s.id, name: s.name })))
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const addBook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBook.title.trim()) return
        setAddingBook(true)
        await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newBook, shelfId: Number(id) }),
        })
        setNewBook({ title: '', subtitle: '', coverColor: '#ff0080', spineColor: '#300010' })
        setAddingBook(false)
        load()
    }

    const confirmDeleteBook = async () => {
        if (!deleteModalId) return
        try {
            const res = await fetch(`/api/books/${deleteModalId}`, { method: 'DELETE' })
            if (res.ok) {
                router.refresh()
                load()
            } else {
                const err = await res.json()
                alert(`ลบไม่สำเร็จ: ${err.error || 'Unknown error'}`)
            }
        } catch (e) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
        }
        setDeleteModalId(null)
    }

    const saveEdit = async () => {
        if (!editingBook) return
        await fetch(`/api/books/${editingBook.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editingBook.title, subtitle: editingBook.subtitle, coverColor: editingBook.coverColor }),
        })
        setEditingBook(null)
        load()
    }

    const moveBook = async (bookId: number, targetShelfId: string) => {
        await fetch(`/api/books/${bookId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shelfId: Number(targetShelfId) }),
        })
        load()
    }

    const triggerCoverUpload = (bookId: number) => {
        coverBookIdRef.current = bookId
        setUploadError(null)
        if (coverInputRef.current) {
            coverInputRef.current.value = ''
            coverInputRef.current.click()
        }
    }

    const uploadCover = async (file: File) => {
        const bookId = coverBookIdRef.current
        if (!bookId) return
        setUploadingCoverId(bookId)
        setUploadError(null)
        try {
            const form = new FormData()
            form.append('coverImage', file)
            const res = await fetch(`/api/books/${bookId}`, { method: 'PATCH', body: form })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                setUploadError(`อัปโหลดล้มเหลว: ${err.detail || res.status}`)
            }
        } catch (e) {
            setUploadError('อัปโหลดล้มเหลว ลองอีกครั้ง')
        }
        setUploadingCoverId(null)
        load()
    }

    return (
        <AdminLayout>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }} className="fade-up">
                <Link href="/admin/shelves" className="btn btn-ghost btn-sm" style={{ padding: '8px 20px' }}>← กลับไปกล่องเก็บ</Link>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', fontWeight: 900 }}>{shelf?.name || 'กำลังโหลดชั้น...'}</h1>
                    <p style={{ color: 'var(--c-text-3)', fontSize: '0.9rem', marginTop: '4px' }}>ปรับแต่งหน้าปกและจัดเรียงหนังสือในเล่มนี้</p>
                </div>
            </div>

            {/* Create Book Glass Card */}
            <div className="glass-panel mb-12 fade-up" style={{ padding: '40px', border: '1px solid rgba(255,255,255,0.08)', animationDelay: '0.1s' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--c-pink)', marginBottom: '24px', fontWeight: 800 }}>➕ เพิ่มความทรงจำใหม่ลงชั้นนี้</h2>
                <form onSubmit={addBook}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', fontWeight: 600 }}>📝 ชื่อหนังสือของความรู้สึุก *</label>
                            <input className="input-premium" placeholder="ระบุชื่อที่สื่อความหมาย เช่น 'Our First Date'" value={newBook.title} onChange={e => setNewBook(p => ({ ...p, title: e.target.value }))} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', fontWeight: 600 }}>🏷️ คำโปรยสั้นๆ (Subtitle)</label>
                            <input className="input-premium" placeholder="เช่น 'วันที่เราพบกันครั้งแรก'..." value={newBook.subtitle} onChange={e => setNewBook(p => ({ ...p, subtitle: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                        <div className="flex items-center gap-6">
                            <div style={{ fontSize: '0.95rem', color: 'var(--c-text-2)', fontWeight: 500 }}>🎨 สีประจำเล่ม:</div>
                            <div className="flex items-center gap-4">
                                <input type="color" value={newBook.coverColor} onChange={e => setNewBook(p => ({ ...p, coverColor: e.target.value, spineColor: '#300010' }))} style={{ width: '60px', height: '48px', border: 'none', background: 'none', cursor: 'pointer' }} />
                                <div style={{ width: '45px', height: '65px', borderRadius: '4px 12px 12px 4px', background: `linear-gradient(160deg, ${newBook.coverColor}, #000)`, boxShadow: `0 8px 16px ${newBook.coverColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>❤️</div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={addingBook} style={{ marginLeft: 'auto', padding: '16px 48px', fontSize: '1.1rem' }}>
                            {addingBook ? '⏳ กำลังแพ็คหนังสือ...' : '✨ สร้างหนังสือเล่มใหม่'}
                        </button>
                    </div>
                </form>
            </div>

            {uploadError && (
                <div className="glass-panel mb-8 fade-up" style={{ padding: '16px 24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ff8a8a', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    ⚠️ {uploadError}
                </div>
            )}

            <input ref={coverInputRef} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />

            {/* Books Grid */}
            {loading ? (
                <div className="text-center" style={{ padding: '100px' }}>
                    <div className="heart-pulse" style={{ fontSize: '4rem' }}>📖</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                    {shelf?.books.map((book, idx) => (
                        <div key={book.id} className="glass-panel fade-up" style={{ overflow: 'hidden', animationDelay: `${idx * 0.08}s`, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                            {/* Preview with Cover Art */}
                            <div
                                style={{ height: '240px', cursor: 'pointer', position: 'relative' }}
                                onClick={() => triggerCoverUpload(book.id)}
                            >
                                {book.coverImageUrl ? (
                                    book.coverImageUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                                        <video src={book.coverImageUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={book.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div style={{ height: '100%', background: `linear-gradient(160deg, ${book.coverColor}, #000)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="heart-pulse" style={{ fontSize: '4rem' }}>❤️</div>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.9) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
                                    <h3 className="text-gradient" style={{ fontWeight: 900, fontSize: '1.5rem', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>{book.title}</h3>
                                    {book.subtitle && <p style={{ fontSize: '0.9rem', color: '#ffb3d9', opacity: 0.8, marginTop: '4px' }}>{book.subtitle}</p>}
                                </div>
                                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>
                                    {uploadingCoverId === book.id ? '⌛ กำลังอัปโหลด...' : '🖼️ เปลี่ยนปกหนังสือ'}
                                </div>
                            </div>

                            {/* Controls */}
                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {editingBook?.id === book.id ? (
                                    <div className="flex flex-col gap-4">
                                        <input className="input-premium" value={editingBook.title} onChange={e => setEditingBook(p => p ? { ...p, title: e.target.value } : null)} />
                                        <input className="input-premium" value={editingBook.subtitle} onChange={e => setEditingBook(p => p ? { ...p, subtitle: e.target.value } : null)} />
                                        <div className="flex gap-2">
                                            <input type="color" value={editingBook.coverColor} onChange={e => setEditingBook(p => p ? { ...p, coverColor: e.target.value } : null)} style={{ width: '48px', height: '48px', border: 'none', background: 'none', cursor: 'pointer' }} />
                                            <button className="btn btn-primary" onClick={saveEdit} style={{ flex: 1 }}>💾 บันทึกการแก้ไข</button>
                                            <button className="btn btn-ghost" onClick={() => setEditingBook(null)}>ยกเลิก</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                            <Link href={`/admin/books/${book.id}`} className="btn btn-primary btn-sm" style={{ padding: '12px', justifyContent: 'center' }}>📖 จัดการหน้าด้านใน</Link>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingBook({ id: book.id, title: book.title, subtitle: book.subtitle || '', coverColor: book.coverColor })}>✏️ แก้ไขปก</button>
                                            <Link href={`/api/qr/${book.id}`} target="_blank" className="btn btn-ghost btn-sm">📷 รับ QR Code</Link>
                                            <button className="btn btn-ghost btn-sm text-danger" onClick={() => setDeleteModalId(book.id)}>🗑️ ลบเล่มนี้</button>
                                        </div>

                                        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                                            <select
                                                className="input-premium"
                                                style={{ fontSize: '0.8rem', padding: '8px 12px', flex: 1 }}
                                                onChange={(e) => moveBook(book.id, e.target.value)}
                                                value={id}
                                            >
                                                {shelves.map(s => <option key={s.id} value={s.id}>ย้ายไปชั้น: {s.name}</option>)}
                                            </select>
                                            <Link href={`/book/${book.qrToken}`} target="_blank" className="btn btn-ghost btn-sm" style={{ padding: '8px' }}>👁️ ดูจริง</Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ConfirmModal
                isOpen={deleteModalId !== null}
                title="🚨 ลบหนังสือเล่มนี้"
                message="หากคุณยืนยันการลบหนังสือเล่มนี้ รูปภาพและหน้าต่างๆ ภายในหนังสือเล่มนี้จะถูกลบออกทั้งหมดอย่างถาวร ยืนยันการกระทำหรือไม่?"
                confirmText="ลบหนังสือถาวร"
                isDanger={true}
                onCancel={() => setDeleteModalId(null)}
                onConfirm={confirmDeleteBook}
            />
        </AdminLayout>
    )
}
