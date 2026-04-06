import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    const shelves = await prisma.shelf.findMany({
        orderBy: { order: 'asc' },
        include: {
            books: {
                orderBy: { order: 'asc' },
                select: {
                    id: true, title: true, coverColor: true, spineColor: true,
                    order: true, qrToken: true, coverImageUrl: true, subtitle: true,
                    pages: {
                        orderBy: { order: 'asc' },
                        take: 1,
                        select: { imageUrl: true }
                    }
                },
            },
        },
    })
    return NextResponse.json(shelves)
}

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()
    const lastShelf = await prisma.shelf.findFirst({ orderBy: { order: 'desc' } })
    const shelf = await prisma.shelf.create({
        data: { name, order: (lastShelf?.order ?? -1) + 1 },
    })
    return NextResponse.json(shelf, { status: 201 })
}
