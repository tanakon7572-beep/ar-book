'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import ConfirmModal from '@/components/ConfirmModal'

type Page = { id: number; order: number; imageUrl: string | null; text: string | null; caption: string | null }
type Book = { id: number; title: string; subtitle?: string | null; qrToken: string; shelf: { id: number; name: string }; pages: Page[] }

export default function BookEditorPage() {
    const { id } = useParams() as { id: string }
    const router = useRouter()
    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [replacingId, setReplacingId] = useState<number | null>(null)
    const [deleteModalId, setDeleteModalId] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const replaceInputRef = useRef<HTMLInputElement>(null)

    const load = async () => {
        const res = await fetch(`/api/books/${id}`)
        if (res.status === 401) { router.push('/admin'); return }
        if (!res.ok) { router.push('/admin/shelves'); return }
        setBook(await res.json())
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const uploadPages = async (files: FileList) => {
        setUploading(true)
        for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('bookId', id)
            await fetch('/api/pages', { method: 'POST', body: formData })
        }
        setUploading(false)
        router.refresh()
        load()
    }

    const replaceImage = async (pageId: number, file: File) => {
        setReplacingId(pageId)
        const formData = new FormData()
        formData.append('image', file)
        await fetch(`/api/pages/${pageId}`, { method: 'PATCH', body: formData })
        setReplacingId(null)
        router.refresh()
        load()
    }

    const updatePage = async (pageId: number, data: Partial<Page>) => {
        await fetch(`/api/pages/${pageId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
    }

    const confirmDeletePage = async () => {
        if (!deleteModalId) return
        try {
            const res = await fetch(`/api/pages/${deleteModalId}`, { method: 'DELETE' })
            if (res.ok) {
                router.refresh()
                load()
            } else {
                alert('ลบทิ้งไม่สำเร็จ กรุณาลองใหม่')
            }
        } catch (e) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        }
        setDeleteModalId(null)
    }

    return (
        <AdminLayout>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', borderBottom: '1px solid var(--c-border)', paddingBottom: '24px' }} className="fade-up">
                <Link href={`/admin/shelves/${book?.shelf.id}`} className="btn btn-ghost btn-sm" style={{ padding: '8px 20px', color: 'var(--c-text-2)' }}>← กลับไปที่หนังสือ</Link>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 900 }}>แก้ไขหน้าหนังสือ:{'\n'}{book?.title}</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--c-text-3)', marginTop: '4px' }}>🖼️ กำลังจัดการ {book?.pages.length || 0} หน้า ในชั้น "{book?.shelf.name}"</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="glass-panel mb-12 fade-up" style={{ padding: '48px', textAlign: 'center', animationDelay: '0.1s', border: '2px dashed var(--c-border)' }}>
                <div className="heart-pulse" style={{ fontSize: '4rem', marginBottom: '20px' }}>📸</div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 800, color: 'var(--c-text)' }}>อัปโหลดความทรงจำหน้าต่อๆ ไป (Add Pages)</h2>
                <p style={{ color: 'var(--c-text-3)', fontSize: '1rem', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                    คลิกปุ่มด้านล่างเพื่อเลือกรูปภาพจากเครื่อง (เลือกหลายรูปได้พร้อมกัน) ภาพจะเรียงต่อกันไป
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
                    {uploading ? '⏳ กำลังอัปโหลด...' : '➕ เลือกรูปภาพพรีเมียม'}
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} onChange={e => { if (e.target.files) uploadPages(e.target.files) }} />
            </div>

            <input ref={replaceInputRef} type="file" accept="image/*,video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} />

            {/* Pages List */}
            {loading ? (
                <div className="text-center" style={{ padding: '100px' }}>
                    <div className="heart-pulse" style={{ fontSize: '4rem' }}>💎</div>
                </div>
            ) : book?.pages.length === 0 ? (
                <div className="glass-panel text-center fade-up" style={{ padding: '80px 40px', border: '1px solid var(--c-border)' }}>
                    <p style={{ color: 'var(--c-text-2)', fontSize: '1.2rem', fontFamily: 'var(--f-serif)', fontStyle: 'italic' }}>
                        ยังไม่มีภาพหน้าในเล่มนี้... เริ่มสร้างเรื่องราวได้เลยครับ
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '32px' }}>
                    {book?.pages.map((p, idx) => (
                        <div key={p.id} className="glass-panel fade-up" style={{ padding: '32px', display: 'flex', gap: '32px', flexWrap: 'wrap', animationDelay: `${idx * 0.08}s` }}>
                            <div style={{ position: 'relative', width: '220px', height: '300px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', background: '#efefef', flexShrink: 0, border: '1px solid var(--c-border)' }}>
                                {p.imageUrl ? (
                                    p.imageUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                                        <video src={p.imageUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-3)', fontSize: '2rem' }}>📷</div>
                                )}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', fontSize: '0.8rem', padding: '8px' }}
                                    onClick={() => {
                                        if (replaceInputRef.current) {
                                            replaceInputRef.current.onchange = (e: any) => {
                                                const file = e.target.files[0];
                                                if (file) replaceImage(p.id, file);
                                            };
                                            replaceInputRef.current.click();
                                        }
                                    }}
                                >
                                    {replacingId === p.id ? '⏳ กำลังเปลี่ยน...' : '🔄 เปลี่ยนรูปหน้านี้'}
                                </button>
                            </div>
                            <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="flex flex-col gap-3">
                                    <label style={{ fontSize: '0.95rem', color: 'var(--c-text-2)', fontWeight: 700 }}>✍️ ข้อความที่ต้องการให้ปรากฏบนรูป (Text Overlay)</label>
                                    <textarea
                                        className="input-premium"
                                        style={{ fontSize: '1rem', minHeight: '100px', lineHeight: 1.6 }}
                                        defaultValue={p.text || ''}
                                        onBlur={e => updatePage(p.id, { text: e.target.value })}
                                        placeholder="ใส่คำพรรณนาซึ้งๆ เช่น 'You are my sunshine'..."
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label style={{ fontSize: '0.95rem', color: 'var(--c-text-2)', fontWeight: 700 }}>🏷️ คำบรรยายใต้ภาพเล็กๆ (Caption)</label>
                                    <input
                                        className="input-premium"
                                        style={{ fontSize: '0.9rem' }}
                                        defaultValue={p.caption || ''}
                                        onBlur={e => updatePage(p.id, { caption: e.target.value })}
                                        placeholder="เช่น 'สวนรถไฟ, 24 มิ.ย. 67'"
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--c-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="badge" style={{ background: 'var(--c-surface)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}>หน้า {idx + 1}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', opacity: 0.8 }}>UID: {p.id}</span>
                                    </div>
                                    <button className="btn btn-ghost btn-sm text-danger" style={{ padding: '8px 16px' }} onClick={() => setDeleteModalId(p.id)}>🗑️ ลบหน้านี้ถาวร</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Floating Preview Bar */}
            <div style={{ position: 'sticky', bottom: '32px', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 100 }}>
                <div className="glass-panel fade-up" style={{ padding: '16px 32px', pointerEvents: 'auto', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid var(--c-pink)', animationDelay: '0.5s' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--c-text)' }}>บันทึกอัตโนมัติ</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>{book?.pages.length || 0} หน้าถูกจัดเรียง</div>
                    </div>
                    <Link href={`/book/${book?.qrToken}`} target="_blank" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                        👁️ ดูผลลัพธ์พรีเมียม
                    </Link>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalId !== null}
                title="🚨 ลบหน้าหนังสือ"
                message="หากคุณยืนยัน รูปภาพและแบบร่างในหน้านี้จะถูกลบทิ้งถาวรจากเล่มหนังสือ ยืนยันใช่หรือไม่?"
                confirmText="ลบหน้า"
                isDanger={true}
                onCancel={() => setDeleteModalId(null)}
                onConfirm={confirmDeletePage}
            />
        </AdminLayout>
    )
}
