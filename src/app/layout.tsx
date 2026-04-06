import type { Metadata } from 'next'
import './globals.css'
import ThemeWrapper from '@/components/ThemeWrapper'

export const metadata: Metadata = {
  title: 'AR Photo Book | สื่อรักผ่านภาพถ่าย',
  description: 'ส่งความรัก ในทุกหน้าที่พลิก ด้วยเทคโนโลยี AR Photo Book',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </body>
    </html>
  )
}
