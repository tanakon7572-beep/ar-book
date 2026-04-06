export default function ShelfLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-light app-container" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>{children}</div>
}
