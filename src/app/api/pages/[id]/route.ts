import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const page = await prisma.page.findUnique({ where: { id: Number(id) } })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(page)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        try {
            const formData = await req.formData()
            const text = formData.get('text') as string | null
            const caption = formData.get('caption') as string | null
            const order = formData.get('order')
            const file = formData.get('image') as File | null

            let imageUrl: string | undefined = undefined

            if (file && file.size > 0) {
                // Delete old image when replacing
                const existing = await prisma.page.findUnique({ where: { id: Number(id) } })
                if (existing?.imageUrl) {
                    try {
                        await unlink(path.join(process.cwd(), 'public', existing.imageUrl))
                    } catch { /* old file may not exist */ }
                }

                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const rawExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg'
                const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(rawExt) ? rawExt : 'jpg'
                const filename = `${crypto.randomUUID()}.${safeExt}`
                const uploadDir = path.join(process.cwd(), 'public', 'uploads')
                await mkdir(uploadDir, { recursive: true })
                await writeFile(path.join(uploadDir, filename), buffer)
                imageUrl = `/uploads/${filename}`
            }

            const page = await prisma.page.update({
                where: { id: Number(id) },
                data: {
                    text: text !== null ? text : undefined,
                    caption: caption !== null ? caption : undefined,
                    order: order !== null ? Number(order) : undefined,
                    ...(imageUrl ? { imageUrl } : {}),
                },
            })
            return NextResponse.json(page)
        } catch (err) {
            console.error('[PATCH /api/pages/id] error:', err)
            return NextResponse.json({ error: 'Failed', detail: String(err) }, { status: 500 })
        }
    }

    const body = await req.json()
    const page = await prisma.page.update({
        where: { id: Number(id) },
        data: {
            text: body.text !== undefined ? body.text : undefined,
            caption: body.caption !== undefined ? body.caption : undefined,
            order: body.order !== undefined ? body.order : undefined,
            imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        },
    })
    return NextResponse.json(page)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const page = await prisma.page.findUnique({ where: { id: Number(id) } })
    if (page?.imageUrl) {
        try { await unlink(path.join(process.cwd(), 'public', page.imageUrl)) } catch { /* ignore */ }
    }
    await prisma.page.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
}
