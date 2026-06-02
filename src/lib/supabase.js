import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL       || null
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY  || null

// In dev mode the keys are intentionally blank — use a no-op stub so
// nothing throws on import. All Supabase calls are guarded by DEV_MODE
// checks in AuthContext and UserContext and will never actually fire.
export const supabase = (SUPABASE_URL && SUPABASE_ANON)
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')
