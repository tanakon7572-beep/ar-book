import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst()
        const data = settings || { backgroundImageUrl: null, backgroundType: 'gradient', siteTitle: 'AR Photo Book', backgroundColor: '#2d0035' }
        return NextResponse.json(data, {
            headers: {
                // cache 30 วิ ที่ browser, 60 วิ ที่ CDN - ลด DB round-trip
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        })
    } catch {
        return NextResponse.json(
            { backgroundImageUrl: null, backgroundType: 'gradient', siteTitle: 'AR Photo Book', backgroundColor: '#2d0035' },
            { status: 200 }
        )
    }
}

export async function PATCH(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData()
        const file = formData.get('background') as File | null
        const backgroundType = formData.get('backgroundType') as string | null
        const siteTitle = formData.get('siteTitle') as string | null
        const backgroundColor = formData.get('backgroundColor') as string | null

        let backgroundImageUrl: string | undefined = undefined
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const rawExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg'
            const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg'
            const filename = `bg-custom.${safeExt}`
            const uploadDir = path.join(process.cwd(), 'public')
            await mkdir(uploadDir, { recursive: true })
            await writeFile(path.join(uploadDir, filename), buffer)
            backgroundImageUrl = `/${filename}`
        }

        let settings = await prisma.siteSettings.findFirst()
        if (!settings) settings = await prisma.siteSettings.create({ data: {} })
        const updated = await prisma.siteSettings.update({
            where: { id: settings.id },
            data: {
                ...(backgroundImageUrl ? { backgroundImageUrl } : {}),
                ...(backgroundType ? { backgroundType } : {}),
                ...(siteTitle ? { siteTitle } : {}),
                ...(backgroundColor ? { backgroundColor } : {}),
            },
        })
        return NextResponse.json(updated)
    }

    const body = await req.json()
    let settings = await prisma.siteSettings.findFirst()
    if (!settings) settings = await prisma.siteSettings.create({ data: {} })
    const updated = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
            backgroundType: body.backgroundType ?? undefined,
            siteTitle: body.siteTitle ?? undefined,
            backgroundColor: body.backgroundColor ?? undefined,
            backgroundImageUrl: 'backgroundImageUrl' in body ? body.backgroundImageUrl : undefined,
        },
    })
    return NextResponse.json(updated)
}
