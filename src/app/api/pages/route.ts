import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'


export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const bookId = Number(formData.get('bookId'))
    const text = formData.get('text') as string | null
    const caption = formData.get('caption') as string | null
    const file = formData.get('image') as File | null

    let imageUrl: string | null = null

    if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const rawExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg'
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'mp4', 'webm', 'mov', 'm4v'].includes(rawExt) ? rawExt : 'jpg'
        const filename = `${crypto.randomUUID()}.${safeExt}`
        
        try {
            // Upload to Supabase Storage
            const { uploadFileToSupabase } = await import('@/lib/supabase')
            imageUrl = await uploadFileToSupabase(buffer, filename, file.type)
        } catch (error) {
            console.error('Supabase upload error:', error)
            return NextResponse.json({ error: 'Failed to upload to cloud storage' }, { status: 500 })
        }
    }

    const lastPage = await prisma.page.findFirst({
        where: { bookId },
        orderBy: { order: 'desc' },
    })

    const page = await prisma.page.create({
        data: {
            bookId,
            imageUrl,
            text: text || null,
            caption: caption || null,
            order: (lastPage?.order ?? -1) + 1,
        },
    })
    return NextResponse.json(page, { status: 201 })
}
