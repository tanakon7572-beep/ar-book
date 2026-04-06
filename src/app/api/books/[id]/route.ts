import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const book = await prisma.book.findUnique({
        where: { id: Number(id) },
        include: { pages: { orderBy: { order: 'asc' } }, shelf: true },
    })
    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(book)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        try {
            const formData = await req.formData()
            const title = formData.get('title') as string | null
            const subtitle = formData.get('subtitle') as string | null
            const coverColor = formData.get('coverColor') as string | null
            const spineColor = formData.get('spineColor') as string | null
            const file = formData.get('coverImage') as File | null

            let coverImageUrl: string | undefined = undefined

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)
                // Use built-in crypto - no external uuid needed
                const uniqueId = crypto.randomUUID()
                const originalName = file.name || 'cover.jpg'
                const ext = originalName.includes('.') ? originalName.split('.').pop()!.toLowerCase() : 'jpg'
                const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'mp4', 'webm', 'mov', 'm4v'].includes(ext) ? ext : 'jpg'
                const filename = `cover-${uniqueId}.${safeExt}`
                const uploadDir = path.join(process.cwd(), 'public', 'uploads')
                await mkdir(uploadDir, { recursive: true })
                await writeFile(path.join(uploadDir, filename), buffer)
                coverImageUrl = `/uploads/${filename}`
            }

            const updateData: Record<string, unknown> = {}
            if (title) updateData.title = title
            if (subtitle !== null) updateData.subtitle = subtitle
            if (coverColor) updateData.coverColor = coverColor
            if (spineColor) updateData.spineColor = spineColor
            if (coverImageUrl) updateData.coverImageUrl = coverImageUrl

            const book = await prisma.book.update({
                where: { id: Number(id) },
                data: updateData,
            })
            return NextResponse.json(book)
        } catch (err) {
            console.error('[PATCH /api/books] multipart error:', err)
            return NextResponse.json({ error: 'Upload failed', detail: String(err) }, { status: 500 })
        }
    }

    // JSON body
    try {
        const body = await req.json()
        const updateData: Record<string, unknown> = {}
        if (body.title !== undefined) updateData.title = body.title
        if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
        if (body.coverColor !== undefined) updateData.coverColor = body.coverColor
        if (body.spineColor !== undefined) updateData.spineColor = body.spineColor
        if (body.order !== undefined) updateData.order = body.order
        if (body.shelfId !== undefined) updateData.shelfId = Number(body.shelfId)
        // explicit null allowed to remove cover
        if ('coverImageUrl' in body) updateData.coverImageUrl = body.coverImageUrl

        const book = await prisma.book.update({
            where: { id: Number(id) },
            data: updateData,
        })
        return NextResponse.json(book)
    } catch (err) {
        console.error('[PATCH /api/books] json error:', err)
        return NextResponse.json({ error: 'Update failed', detail: String(err) }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.book.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
}
