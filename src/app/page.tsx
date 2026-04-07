'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

type SiteSettings = { backgroundColor: string; siteTitle: string; backgroundType: string; backgroundImageUrl?: string | null }

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const router = useRouter()
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings)
  }, [])

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        if (!scannerRef.current && scanning) {
          scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false) as any
          scannerRef.current?.render((decodedText: string) => {
            if (decodedText.includes('/book/')) {
              const token = decodedText.split('/book/')[1]
              router.push(`/book/${token}`)
              scannerRef.current?.clear()
            }
          }, console.error)
        }
      })
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
        <div className="fade-up" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000', display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar Floating over the camera */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,0.8), transparent)' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>🔍 สแกน QR Code หนังสือ</h2>
            <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: '30px', padding: '8px 24px', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setScanning(false)}>ปิดกล้อง</button>
          </div>

          <div id="reader" style={{ flex: 1, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Animating Scan Line Overlay - Center Area */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '280px', height: '280px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '24px',
              boxShadow: '0 0 0 4000px rgba(0,0,0,0.65)',
              zIndex: 10, pointerEvents: 'none'
            }}>
                {/* Corner markers */}
                <div style={{position: 'absolute', top: '-3px', left: '-3px', width: '40px', height: '40px', borderTop: '5px solid var(--c-pink)', borderLeft: '5px solid var(--c-pink)', borderTopLeftRadius: '24px' }} />
                <div style={{position: 'absolute', top: '-3px', right: '-3px', width: '40px', height: '40px', borderTop: '5px solid var(--c-pink)', borderRight: '5px solid var(--c-pink)', borderTopRightRadius: '24px' }} />
                <div style={{position: 'absolute', bottom: '-3px', left: '-3px', width: '40px', height: '40px', borderBottom: '5px solid var(--c-pink)', borderLeft: '5px solid var(--c-pink)', borderBottomLeftRadius: '24px' }} />
                <div style={{position: 'absolute', bottom: '-3px', right: '-3px', width: '40px', height: '40px', borderBottom: '5px solid var(--c-pink)', borderRight: '5px solid var(--c-pink)', borderBottomRightRadius: '24px' }} />
                
                {/* Scan line */}
                <div style={{
                  position: 'absolute', top: 0, left: 10, right: 10, height: '4px',
                  background: 'var(--c-pink)', boxShadow: '0 0 15px 3px var(--c-pink)',
                  animation: 'scan-line-vertical 2.5s ease-in-out infinite', zIndex: 10
                }} />
            </div>
          </div>

          {/* Bottom Hint */}
          <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, textAlign: 'center', zIndex: 100, padding: '0 20px', pointerEvents: 'none' }}>
             <p style={{ display: 'inline-block', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '30px', color: '#fff', fontSize: '0.95rem' }}>
                จัด QR Code ให้อยู่ในกรอบเพื่อเปิดหน้าหนังสือ
             </p>
          </div>

          <style jsx global>{`
            @keyframes scan-line-vertical {
              0% { top: 10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 90%; opacity: 0; }
            }
            #reader {
              border: none !important;
              background: #000;
            }
            #reader__scan_region {
              background: #000 !important;
            }
            #reader__scan_region img {
              display: none !important; 
            }
            #reader video {
              width: 100vw !important;
              height: 100vh !important;
              object-fit: cover !important;
              border-radius: 0 !important;
            }
            #reader__dashboard_section_csr {
              position: absolute !important;
              bottom: 120px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 200;
              width: 90%;
              max-width: 400px;
              background: rgba(0,0,0,0.7);
              backdrop-filter: blur(10px);
              padding: 16px;
              border-radius: 16px;
              border: 1px solid rgba(255,255,255,0.1);
            }
            #reader__dashboard_section_csr select {
              width: 100%;
              padding: 12px;
              border-radius: 8px;
              background: rgba(255,255,255,0.1) !important;
              color: white !important;
              border: 1px solid rgba(255,255,255,0.2) !important;
              margin-bottom: 12px;
              font-size: 1rem;
            }
            #reader__dashboard_section_csr button {
              width: 100%;
              padding: 14px 16px;
              border-radius: 8px;
              background: var(--c-pink) !important;
              color: white !important;
              border: none !important;
              font-family: inherit;
              font-weight: bold;
              font-size: 1.1rem;
              cursor: pointer;
            }
            #reader a { display: none; }
          `}</style>
        </div>
      )}

      {/* Footer Info */}
      <footer style={{ position: 'fixed', bottom: '24px', textAlign: 'center', color: 'var(--c-text-3)', fontSize: '0.85rem' }}>
        <p>© 2024 Ar Photo Book — Made with ❤️</p>
      </footer>

    </div>
  )
}
