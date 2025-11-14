import { createClient } from "@supabase/supabase-js"
import { Database } from "../types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}
if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_KEY environment variable")
}

// This is the private, server-side admin client.
// It should only be used in server-side code (API routes, server components).
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})