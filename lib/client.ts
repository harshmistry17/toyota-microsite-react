import { createClient } from "@supabase/supabase-js"
import { Database } from "../types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}
if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// This is the public, client-side safe client.
// It can be used in any component, client or server.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)