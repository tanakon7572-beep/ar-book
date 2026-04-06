import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const book = await prisma.book.findUnique({
        where: { qrToken: token },
        include: {
            pages: { orderBy: { order: 'asc' } },
            shelf: { select: { name: true } },
        },
    })
    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(book)
}
