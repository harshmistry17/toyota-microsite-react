// import { createClient } from "@supabase/supabase-js"
// import { Database } from "@/lib/types" // We'll create this next

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// if (!supabaseUrl) {
//   throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
// }
// if (!supabaseAnonKey) {
//   throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
// }

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// // Create a singleton admin client
// export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false,
//   },
// })

import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/types" // We'll create this next

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// --- FIX: Add the Service Role Key variable ---
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}
if (!supabaseAnonKey) {
  // --- FIX: Corrected error message to match the variable used ---
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}
// --- FIX: Add check for the new Service Key ---
if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

// This is the public, client-side client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a singleton admin client
// --- FIX: Use the 'supabaseServiceKey' here ---
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})