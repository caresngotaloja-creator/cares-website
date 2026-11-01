import { createClient } from '@supabase/supabase-js'

// Clean pasted values: remove spaces, line breaks and quotes
const clean = (v) => (v || '').toString().trim().replace(/^["']+|["']+$/g, '').trim()

const url = clean(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, '')
const key = clean(import.meta.env.VITE_SUPABASE_ANON_KEY)

let client = null
export let configError = ''

if (url && key && !url.includes('YOUR-PROJECT') && !key.includes('PASTE')) {
  try {
    new URL(url)
    client = createClient(url, key)
  } catch (e) {
    configError = 'The Supabase URL or key in the host settings is not valid: ' + e.message
    console.error(configError)
  }
}

/** false until the two values are set correctly (public pages still open, with default text) */
export const configured = Boolean(client)
export const supabase = client

export const BUCKET = 'gallery'

export function publicUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
