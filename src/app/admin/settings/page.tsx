'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

type Settings = { backgroundImageUrl?: string | null; backgroundType: string; siteTitle: string; backgroundColor: string }

const COLOR_PRESETS = [
    { label: 'Vibrant Pink', value: '#ff0080' },
    { label: 'Hot Pink', value: '#ff69b4' },
    { label: 'Deep Pink', value: '#ff1493' },
    { label: 'Fuchsia', value: '#ff00ff' },
    { label: 'Neon Rose', value: '#ff007f' },
    { label: 'Purple Gem', value: '#bf40ff' },
    { label: 'Royal Violet', value: '#7a00ff' },
    { label: 'Rose Gold', value: '#ff91a4' },
    { label: 'Ruby', value: '#e0115f' },
    { label: 'Crimson Glow', value: '#dc143c' },
    { label: 'Peach Dream', value: '#ff8a8a' },
    { label: 'Soft Lavender', value: '#d8b4fe' },
]

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [form, setForm] = useState({ siteTitle: '', backgroundType: 'gradient', backgroundColor: '#ff0080' })
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const load = async () => {
        const res = await fetch('/api/settings')
        if (res.status === 401) { router.push('/admin'); return }
        const data = await res.json()
        setSettings(data)
        setForm({
            siteTitle: data.siteTitle || 'AR Photo Book | สื่อรักผ่านภาพถ่าย',
            backgroundType: data.backgroundType || 'gradient',
            backgroundColor: data.backgroundColor || '#ff0080'
        })
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        setSaving(false)
        load()
    }

    const uploadBackground = async (file: File) => {
        setUploading(true)
        const fd = new FormData()
        fd.append('background', file)
        fd.append('backgroundType', 'image')
        fd.append('siteTitle', form.siteTitle)
        await fetch('/api/settings', { method: 'PATCH', body: fd })
        setUploading(false)
        load()
    }

    const removeBackground = async () => {
        await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backgroundType: 'gradient', backgroundImageUrl: null }) })
        load()
    }

    return (
        <AdminLayout>
            <div className="mb-10 fade-up">
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚙️ ตั้งค่าความเป็นคุณ</h1>
                <p style={{ color: 'var(--c-text-3)', fontSize: '1rem' }}>ปรับจูนธีมและข้อมูลหลักเพื่อให้เว็บไซต์เป็นตัวเราที่สุด</p>
            </div>

            {loading ? (
                <div className="text-center" style={{ padding: '80px' }}>
                    <div className="heart-pulse" style={{ fontSize: '2.5rem' }}>💠</div>
                    <p style={{ marginTop: '16px', color: 'var(--c-text-3)' }}>กำลังโหลดการตั้งค่า...</p>
                </div>
            ) : (
                <form onSubmit={saveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

                    {/* Title Settings */}
                    <div className="glass-panel fade-up" style={{ padding: '32px', gridColumn: '1 / -1', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--c-pink)', marginBottom: '20px', fontWeight: 800 }}>🏷️ ข้อมูลพื้นฐาน (Site Info)</h2>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', fontWeight: 600 }}>ชื่อหัวข้อหลักของเว็บไซต์ (Site Title)</label>
                            <input className="input-premium" value={form.siteTitle} onChange={e => setForm(p => ({ ...p, siteTitle: e.target.value }))} placeholder="เช่น AR Photo Book | สื่อรักผ่านภาพถ่าย" />
                            <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', marginTop: '4px' }}>ชื่อนี้จะปรากฏที่เมนูหลักและหัวข้อหน้าสแกน QR</p>
                        </div>
                    </div>

                    {/* Theme Customizer */}
                    <div className="glass-panel fade-up" style={{ padding: '32px', animationDelay: '0.1s', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--c-pink)', marginBottom: '24px', fontWeight: 800 }}>🎨 สีสันเว็บไซต์ (Theme Color)</h2>

                        {/* Color Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' }}>
                            {COLOR_PRESETS.map(c => (
                                <div
                                    key={c.value}
                                    onClick={() => setForm(p => ({ ...p, backgroundColor: c.value }))}
                                    style={{
                                        aspectRatio: '1/1', borderRadius: '50%', background: c.value, cursor: 'pointer',
                                        border: form.backgroundColor === c.value ? '2px solid #fff' : '2px solid transparent',
                                        boxShadow: form.backgroundColor === c.value ? `0 0 20px ${c.value}, inset 0 2px 5px rgba(255,255,255,0.5)` : 'inset 0 2px 5px rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                        transform: form.backgroundColor === c.value ? 'scale(1.2)' : 'scale(1)'
                                    }}
                                    title={c.label}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <input type="color" value={form.backgroundColor} onChange={e => setForm(p => ({ ...p, backgroundColor: e.target.value }))} style={{ width: '56px', height: '48px', border: 'none', background: 'none', cursor: 'pointer' }} />
                            <input className="input-premium" value={form.backgroundColor} onChange={e => setForm(p => ({ ...p, backgroundColor: e.target.value }))} placeholder="#ff0080" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
                        </div>

                        {/* Preview Panel */}
                        <div className="text-sm font-bold mb-3" style={{ color: 'var(--c-text-3)', letterSpacing: '0.05em' }}>LIVE PREVIEW</div>
                        <div style={{
                            height: '140px', borderRadius: '16px', overflow: 'hidden', position: 'relative',
                            background: `linear-gradient(135deg, ${form.backgroundColor}, #1a0028)`,
                            border: '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)`
                        }}>
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.6, background: `radial-gradient(circle at 10% 10%, ${form.backgroundColor}aa, transparent)` }} />
                            <div className="heart-pulse" style={{ fontSize: '3rem', position: 'relative', zIndex: 1, filter: `drop-shadow(0 0 15px ${form.backgroundColor})` }}>❤️</div>
                        </div>
                    </div>

                    {/* Background Strategy */}
                    <div className="glass-panel fade-up" style={{ padding: '32px', animationDelay: '0.2s', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--c-pink)', marginBottom: '24px', fontWeight: 800 }}>🖼️ รูปถ่ายพื้นหลัง (Custom Background)</h2>

                        <div className="flex gap-4 mb-6">
                            {(['gradient', 'image'] as const).map(t => (
                                <button
                                    key={t} type="button"
                                    className={form.backgroundType === t ? 'btn btn-primary' : 'btn btn-ghost'}
                                    onClick={() => setForm(p => ({ ...p, backgroundType: t }))}
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    {t === 'gradient' ? '🌈 สีไล่เฉดล้วน' : '📸 ผสมรูปถ่าย'}
                                </button>
                            ))}
                        </div>

                        {/* Image Upload Area */}
                        <div style={{ opacity: form.backgroundType === 'image' ? 1 : 0.3, pointerEvents: form.backgroundType === 'image' ? 'auto' : 'none', transition: 'all 0.3s' }}>
                            {settings?.backgroundImageUrl && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={settings.backgroundImageUrl} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
                                    <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--c-text-2)' }}>✓ ติดตั้งรูปแล้ว</div>
                                    <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={removeBackground}>🗑️ นำออก</button>
                                </div>
                            )}
                            <div
                                className={`drop-zone${dragOver ? ' dragover' : ''}`}
                                style={{ padding: '40px 20px', borderStyle: 'dashed', borderWidth: '2px', borderColor: dragOver ? 'var(--c-pink)' : 'rgba(255,255,255,0.15)', background: dragOver ? 'rgba(255,0,128,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadBackground(f) }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px', opacity: 0.8 }}>📥</span>
                                <p style={{ fontSize: '0.9rem', color: 'var(--c-text-2)', fontWeight: 600 }}>
                                    {uploading ? '⏳ กำลังอัปโหลดภาพ...' : 'คลิกหรือลากรูปภาพมาวางที่นี่'}
                                </p>
                                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadBackground(f) }} />
                            </div>
                        </div>
                    </div>

                    {/* Save Action */}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                        <button type="submit" className={saved ? 'btn btn-primary' : 'btn btn-primary'} disabled={saving} style={{ padding: '20px 48px', fontSize: '1.1rem', boxShadow: `0 16px 48px ${form.backgroundColor}55`, borderRadius: '12px' }}>
                            {saving ? '⏳ กำลังส่งข้อมูล...' : saved ? '✅ การตั้งค่าถูกบันทึกแล้ว!' : '💾 บันทึกการตั้งค่าระบบใหม่ทั้งหมด'}
                        </button>
                    </div>
                </form>
            )}
        </AdminLayout>
    )
}
