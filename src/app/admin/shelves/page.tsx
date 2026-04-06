'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import ConfirmModal from '@/components/ConfirmModal'

type Book = { id: number; title: string; coverColor: string; spineColor: string; qrToken: string; order: number; coverImageUrl?: string | null }
type Shelf = { id: number; name: string; order: number; books: Book[] }

export default function AdminShelvesPage() {
    const [shelves, setShelves] = useState<Shelf[]>([])
    const [loading, setLoading] = useState(true)
    const [newShelfName, setNewShelfName] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState('')
    const [deleteModalId, setDeleteModalId] = useState<number | null>(null)
    const router = useRouter()

    const load = () =>
        fetch('/api/shelves').then(r => {
            if (r.status === 401) { router.push('/admin'); return }
            return r.json()
        }).then(data => { if (data) setShelves(data); setLoading(false) })

    useEffect(() => { load() }, [])

    const addShelf = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newShelfName.trim()) return
        const res = await fetch('/api/shelves', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newShelfName }) })
        if (res.status === 401) { router.push('/admin'); return }
        setNewShelfName('')
        load()
    }

    const confirmDeleteShelf = async () => {
        if (!deleteModalId) return
        try {
            const res = await fetch(`/api/shelves/${deleteModalId}`, { method: 'DELETE' })
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

    const saveEdit = async (id: number) => {
        await fetch(`/api/shelves/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingName }) })
        setEditingId(null)
        load()
    }

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div className="fade-up">
                    <h1 className="text-gradient" style={{ fontSize: '2.8rem', letterSpacing: '-0.02em', fontWeight: 900 }}>จัดการชั้นหนังสือ</h1>
                    <p style={{ color: 'var(--c-text-3)', fontSize: '0.95rem', marginTop: '4px' }}>สร้างและจัดการคอลเลกชันความทรงจำส่วนตัวของคุณ</p>
                </div>
            </div>

            {/* Add Shelf Section */}
            <div className="glass-panel mb-12 fade-up" style={{ padding: '32px', animationDelay: '0.1s', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-glass)' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--c-pink)', marginBottom: '20px', fontWeight: 800 }}>🏗️ สร้างชั้นเก็บความจำใหม่</h2>
                <form onSubmit={addShelf} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <input className="input-premium" style={{ flex: 1, minWidth: '250px' }} placeholder="ระบุชื่อชั้น เช่น 'Love Memories 2024'..." value={newShelfName} onChange={e => setNewShelfName(e.target.value)} required />
                    <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '1rem' }}>+ สร้างชั้นหนังสือ</button>
                </form>
            </div>

            {loading ? (
                <div className="text-center" style={{ padding: '100px' }}>
                    <div className="heart-pulse" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>🏺</div>
                    <p style={{ color: 'var(--c-text-3)', fontStyle: 'italic' }}>กำลังโหลดชั้นวาง...</p>
                </div>
            ) : shelves.length === 0 ? (
                <div className="glass-panel text-center fade-up" style={{ padding: '100px 40px', borderStyle: 'dashed', animationDelay: '0.2s', borderWidth: '2px', borderColor: 'var(--c-border)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.8 }}>🏜️</div>
                    <p style={{ color: 'var(--c-text-2)', fontSize: '1.3rem', fontFamily: 'var(--f-serif)' }}>ฐานข้อมูลยังว่างเปล่า เล่มความทรงจำถูกเก็บเอาไว้ เริ่มสร้างได้เลย!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '32px' }}>
                    {shelves.map((shelf, idx) => (
                        <div key={shelf.id} className="glass-panel fade-up" style={{ padding: '36px', animationDelay: `${idx * 0.1}s`, position: 'relative', overflow: 'hidden', border: '1px solid var(--c-border)' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '10rem', opacity: 0.015, pointerEvents: 'none', transform: 'rotate(15deg)' }}>📂</div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {editingId === shelf.id ? (
                                        <input className="input-premium" value={editingName} onChange={e => setEditingName(e.target.value)} style={{ width: '320px', fontSize: '1.1rem' }} autoFocus />
                                    ) : (
                                        <h2 className="text-gradient" style={{ fontSize: '1.9rem', fontWeight: 900 }}>{shelf.name}</h2>
                                    )}
                                    <div style={{ background: 'var(--g-pink)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900, color: '#fff', boxShadow: '0 4px 10px rgba(255,0,128,0.2)' }}>{shelf.books.length} BOOKS</div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {editingId === shelf.id ? (
                                        <>
                                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(shelf.id)}>💾 บันทึกการแก้ไข</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>ยกเลิก</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-ghost btn-sm" style={{ padding: '10px' }} onClick={() => { setEditingId(shelf.id); setEditingName(shelf.name) }}>✏️ เปลี่ยนชื่อ</button>
                                            <Link href={`/admin/shelves/${shelf.id}`} className="btn btn-primary btn-sm" style={{ padding: '10px 32px' }}>📕 เปิดตู้นี้</Link>
                                            <button className="btn btn-ghost btn-sm text-danger" onClick={() => setDeleteModalId(shelf.id)} style={{ padding: '10px' }}>🗑️ ลบชั้น</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Mini Previews */}
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '24px', background: 'var(--c-surface)', borderRadius: '20px', border: '1px solid var(--c-border)' }}>
                                {shelf.books.length === 0 ? (
                                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--c-text-3)', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px' }}>ยังไม่มีหนังสือถูกจัดเรียงในชั้นนี้</div>
                                ) : shelf.books.slice(0, 12).map(book => (
                                    <div
                                        key={book.id}
                                        style={{
                                            width: '64px', height: '90px', borderRadius: '4px 12px 12px 4px',
                                            background: book.coverImageUrl ? `url(${book.coverImageUrl}) center/cover` : `linear-gradient(165deg, ${book.coverColor}, #000)`,
                                            boxShadow: `0 10px 20px rgba(0,0,0,0.6), inset 2px 0 3px rgba(255,255,255,0.1)`,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            cursor: 'pointer', position: 'relative'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                                    >
                                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'rgba(0,0,0,0.4)', borderRadius: '2px 0 0 2px' }} />
                                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>❤️</span>
                                    </div>
                                ))}
                                {shelf.books.length > 12 && (
                                    <div style={{ alignSelf: 'center', padding: '0 12px', color: 'var(--c-pink)', fontWeight: 800 }}>+{shelf.books.length - 12}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalId !== null}
                title="🚨 ลบชั้นหนังสือ"
                message="หากคุณยืนยันการลบชั้นหนังสือชั้นนี้ รูปภาพและหนังสือทั้งหมดภายในนี้จะถูกลบทิ้งอย่างถาวร (ลบข้อมูลออกจากฐานข้อมูล) คุณแน่ใจหรือไม่ที่จะลบชั้นนี้?"
                confirmText="ลบชั้นหนังสือ"
                isDanger={true}
                onCancel={() => setDeleteModalId(null)}
                onConfirm={confirmDeleteShelf}
            />
        </AdminLayout>
    )
}
