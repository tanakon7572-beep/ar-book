'use client'
import { useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type Settings = {
    backgroundImageUrl?: string | null;
    backgroundType: string;
    siteTitle: string;
    backgroundColor: string
}

function hexToAmbient(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return {
        l: `rgba(${r},${Math.max(g - 20, 0)},${Math.max(b - 20, 0)},0.45)`,
        r: `rgba(${Math.max(r - 60, 0)},${Math.max(g - 40, 0)},${Math.min(b + 40, 255)},0.35)`,
        c: `rgba(${r},${Math.max(g - 40, 0)},${Math.max(b - 20, 0)},0.12)`,
    }
}

export default function ThemeWrapper({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null)
    const pathname = usePathname()

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings')
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch (e) {
            console.error('Failed to fetch settings', e)
        }
    }

    // Fetch settings ONLY once on mount or if settings are missing
    useEffect(() => {
        if (!settings) fetchSettings()
    }, [pathname]) // Still depend on pathname to ensure refresh on navigation if needed, but the guard handles bulk.

    const ambient = settings?.backgroundColor ? hexToAmbient(settings.backgroundColor) : null
    const showImage = settings?.backgroundType === 'image' && settings?.backgroundImageUrl

    return (
        <div
            className="app-container"
            style={{
                ...(settings?.backgroundColor ? {
                    '--ambient-l': ambient?.l,
                    '--ambient-r': ambient?.r,
                    '--ambient-c': ambient?.c,
                    '--c-bg': settings.backgroundColor // Sync core background color
                } as any : {})
            }}
        >
            <div className="app-background-layer">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div
                    className={`bg-image-layer${showImage ? ' visible' : ''}`}
                    style={{ backgroundImage: showImage ? `url('${settings.backgroundImageUrl}')` : 'none' }}
                />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    )
}
