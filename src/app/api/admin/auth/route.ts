import { NextResponse } from 'next/server'
import { checkPassword, createSession } from '@/lib/session'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    const { password } = await req.json()
    if (!checkPassword(password)) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    const token = await createSession()
    const cookieStore = await cookies()
    cookieStore.set('ar-admin-session', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
    })
    return NextResponse.json({ success: true })
}

export async function DELETE() {
    const cookieStore = await cookies()
    cookieStore.delete('ar-admin-session')
    return NextResponse.json({ success: true })
}
