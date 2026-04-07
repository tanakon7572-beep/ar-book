import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use Service Role to bypass RLS for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function uploadFileToSupabase(file: ArrayBuffer | Buffer | File, filename: string, contentType: string) {
    const { data, error } = await supabase.storage
        .from('ar-book-uploads')
        .upload(filename, file, {
            contentType,
            cacheControl: '3600',
            upsert: true
        })

    if (error) throw error

    // Generate Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('ar-book-uploads')
        .getPublicUrl(filename)

    return publicUrl
}

export async function deleteFileFromSupabase(filename: string) {
    const { error } = await supabase.storage
        .from('ar-book-uploads')
        .remove([filename])

    if (error) {
        console.error('Failed to delete file from Supabase Storage:', error)
    }
}
