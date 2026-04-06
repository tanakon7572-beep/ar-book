export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-light app-container" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>{children}</div>
}
