import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const shelf = await prisma.shelf.findUnique({
        where: { id: Number(id) },
        include: {
            books: {
                orderBy: { order: 'asc' },
                select: {
                    id: true, title: true, subtitle: true, coverColor: true,
                    spineColor: true, coverImageUrl: true, qrToken: true, order: true,
                    pages: {
                        orderBy: { order: 'asc' },
                        take: 1,
                        select: { imageUrl: true }
                    }
                }
            }
        },
    })
    if (!shelf) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(shelf)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const shelf = await prisma.shelf.update({
        where: { id: Number(id) },
        data: { name: body.name, order: body.order },
    })
    return NextResponse.json(shelf)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.shelf.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
}
