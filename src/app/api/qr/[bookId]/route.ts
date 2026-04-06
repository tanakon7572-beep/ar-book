import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function GET(req: Request, { params }: { params: Promise<{ bookId: string }> }) {
    const { bookId } = await params
    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } })
    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/book/${book.qrToken}`

    const qrBuffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 400,
        margin: 2,
        color: { dark: '#2D1B33', light: '#FFF0F5' },
    })

    return new NextResponse(new Uint8Array(qrBuffer), {
        headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `inline; filename="qr-book-${book.id}.png"`,
        },
    })
}
