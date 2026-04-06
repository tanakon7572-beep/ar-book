import { cookies } from 'next/headers'

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234'

export async function getSession() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('ar-admin-session')
    if (!sessionCookie) return null
    try {
        const decoded = Buffer.from(sessionCookie.value, 'base64').toString()
        if (decoded === `authenticated:${SESSION_SECRET}`) {
            return { authenticated: true }
        }
    } catch {
        return null
    }
    return null
}

export async function createSession() {
    const token = Buffer.from(`authenticated:${SESSION_SECRET}`).toString('base64')
    return token
}

export function checkPassword(password: string) {
    return password === ADMIN_PASSWORD
}
