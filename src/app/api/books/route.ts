import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    const books = await prisma.book.findMany({
        orderBy: [{ shelfId: 'asc' }, { order: 'asc' }],
        include: { pages: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json(books)
}

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, shelfId, coverColor, spineColor } = await req.json()
    const lastBook = await prisma.book.findFirst({
        where: { shelfId: Number(shelfId) },
        orderBy: { order: 'desc' },
    })
    const book = await prisma.book.create({
        data: {
            title,
            shelfId: Number(shelfId),
            coverColor: coverColor || '#8B2252',
            spineColor: spineColor || '#5C1A38',
            order: (lastBook?.order ?? -1) + 1,
        },
    })
    return NextResponse.json(book, { status: 201 })
}
