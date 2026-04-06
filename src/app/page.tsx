'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Link from 'next/link'

type SiteSettings = { backgroundColor: string; siteTitle: string; backgroundType: string; backgroundImageUrl?: string | null }

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const router = useRouter()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings)
  }, [])

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false)
      scannerRef.current.render((decodedText) => {
        if (decodedText.includes('/book/')) {
          const token = decodedText.split('/book/')[1]
          router.push(`/book/${token}`)
          scannerRef.current?.clear()
        }
      }, console.error)
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [scanning, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Decorative Floating Orbs (Extra layer of WOW) */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <div className="floating-orb" style={{ width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)', top: '10%', left: '10%', animationDelay: '0s' }} />
        <div className="floating-orb" style={{ width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(130,0,255,0.12) 0%, transparent 70%)', bottom: '15%', right: '15%', animationDelay: '-4s' }} />
      </div>

      <div className="text-center mb-10 fade-up">
        <div className="heart-pulse" style={{ fontSize: '6rem', marginBottom: '32px', display: 'inline-block' }}>❤️</div>
        <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 10vw, 4.5rem)', marginBottom: '16px', letterSpacing: '-0.03em', fontWeight: 900 }}>
          {settings?.siteTitle || 'AR Photo Book'}
        </h1>
        <p style={{ color: 'var(--c-text-2)', fontSize: '1.2rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'var(--f-serif)' }}>
          "เปิดประตูสู่ความทรงจำที่มีชีวิต ด้วยสัมผัสจากภาพถ่ายของคุณ"
        </p>
      </div>

      {!scanning ? (
        <div className="glass-panel text-center fade-up" style={{ padding: '60px 40px', maxWidth: '500px', animationDelay: '0.2s' }}>
          <div style={{ position: 'relative', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--g-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: '0 0 40px rgba(255,0,128,0.4)', zIndex: 2 }}>
              📸
            </div>
            {/* Pulsing ring around the icon */}
            <div style={{ position: 'absolute', inset: '-10px', border: '2px solid var(--c-pink)', borderRadius: '50%', opacity: 0.3, animation: 'heartbeat 2s infinite' }} />
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', fontWeight: 600 }}>เริ่มต้นใช้งาน</h2>
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.95rem', marginBottom: '32px' }}>คลิกปุ่มด้านล่างเพื่อสแกน QR Code บนหนังสือ หรือเข้าไปชมคลังหนังสือทั้งหมดได้เลย</p>

          <div className="flex flex-col gap-4">
            <button className="btn btn-primary btn-lg w-full" onClick={() => setScanning(true)} style={{ padding: '20px', fontSize: '1.2rem' }}>
              🔍 สแกน QR Code ของคุณ
            </button>
            <Link href="/shelf" className="btn btn-ghost btn-lg w-full">
              📚 ไปที่ชั้นหนังสือ
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel fade-up" style={{ padding: '32px', width: '100%', maxWidth: '600px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--c-pink)' }}>🔍 กำลังมองหาหัวใจ...</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setScanning(false)}>ยกเลิก</button>
          </div>

          <div id="reader" style={{ overflow: 'hidden', borderRadius: '24px', border: '5px solid rgba(255,255,255,0.05)', background: '#000', position: 'relative' }}>
            {/* Animating Scan Line Overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'var(--c-pink)', boxShadow: '0 0 20px var(--c-pink)',
              animation: 'scan-line 3s linear infinite', zIndex: 10
            }} />
          </div>

          <p className="text-center mt-6" style={{ fontSize: '0.9rem', color: 'var(--c-text-3)' }}>
            ส่องไปหน้า QR Code เพื่อเปิดอัลบั้มความทรงจำ
          </p>
        </div>
      )}

      {/* Footer Info */}
      <footer style={{ position: 'fixed', bottom: '24px', textAlign: 'center', color: 'var(--c-text-3)', fontSize: '0.85rem' }}>
        <p>© 2024 Ar Photo Book — Made with ❤️</p>
      </footer>

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
