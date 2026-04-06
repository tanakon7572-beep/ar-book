'use client'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    isDanger?: boolean
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    onConfirm,
    onCancel,
    isDanger = false
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="glass-panel" style={{
                width: '90%', maxWidth: '400px', padding: '32px',
                animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                border: `1px solid ${isDanger ? 'rgba(255, 77, 77, 0.3)' : 'var(--c-border)'}`,
                boxShadow: `0 24px 60px rgba(0,0,0,0.8), 0 0 40px ${isDanger ? 'rgba(255, 77, 77, 0.1)' : 'var(--c-pink-0.2)'}`
            }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: isDanger ? '#ff4d4d' : 'var(--c-pink)', fontWeight: 800 }}>{title}</h3>
                <p style={{ color: 'var(--c-text-2)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '32px' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={onCancel} style={{ padding: '10px 20px' }}>
                        {cancelText}
                    </button>
                    <button className="btn btn-primary" onClick={() => { onConfirm(); onCancel(); }} style={{ padding: '10px 24px', background: isDanger ? 'linear-gradient(135deg, #ff4d4d, #cc0000)' : undefined }}>
                        {confirmText}
                    </button>
                </div>
            </div>
            <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
        </div>
    )
}
