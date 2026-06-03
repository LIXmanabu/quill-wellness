import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL       || null
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY  || null

// True only when real project keys are provided. When false, the app runs
// in local-only mode (localStorage); when true, auth + profiles use the
// real Supabase database. The anon key is public by design — Row-Level
// Security on the database is what keeps each user's data private.
export const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON)

// When keys are blank, use a harmless placeholder client so imports never
// throw; nothing calls it because SUPABASE_ENABLED gates every usage.
export const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')
