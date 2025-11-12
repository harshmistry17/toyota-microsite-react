import DashboardWrapper from "@/components/dashboard-wrapper"
import { supabaseAdmin } from "@/lib/supabase-admin" // <-- Import the admin client
import { calculateStats } from "@/lib/utils" // <-- Import the stats helper

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// This is a Server Component
export default async function Dashboard() {
  console.log('[Server] Dashboard - Starting data fetch...')

  // 1. Fetch all users
  const { data: users, error: usersError } = await supabaseAdmin
    .from("toyota_microsite_users")
    .select("*")
    .order("created_at", { ascending: false })

  console.log('[Server] Users fetch result:', {
    count: users?.length,
    error: usersError?.message
  })

    // 2. Fetch all city data for filters and count cards
  const { data: cities, error: citiesError } = await supabaseAdmin
    .from("toyota_microsite_city_config")
    .select("*") // <-- fetch all fields, not just city_name
    .order("city_name", { ascending: true })

  console.log('[Server] Cities fetch result:', {
    count: cities?.length,
    error: citiesError?.message
  })

  // 3. Handle errors
  if (usersError || citiesError) {
    console.error('[Server] Dashboard fetch error:', { usersError, citiesError })
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold text-red-500">Error fetching data</h1>
        <p>{usersError?.message || citiesError?.message}</p>
        <p className="mt-4 text-sm text-gray-400">Check server logs for details</p>
      </div>
    )
  }

  // 4. Calculate stats on the server
  const stats = calculateStats(users || [])
  const cityNames = cities?.map(c => c.city_name) || []

  // 5. Pass data to the Client Component with Auth Wrapper
 return (
  <DashboardWrapper
    initialUsers={users || []}
    allCities={cities || []} // Pass full city data
    stats={stats}
  />
)
}