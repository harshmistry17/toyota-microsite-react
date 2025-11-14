// dashboard/page.tsx
import DashboardWrapper from "@/components/dashboard-wrapper"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { calculateStats } from "@/lib/utils"

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// This is a Server Component
export default async function Dashboard() {
  console.log('[Server] Dashboard - Starting data fetch...')

  try {
    // 1. Fetch ALL users with pagination handling
    let allUsers: any[] = []
    let page = 0
    const pageSize = 1000 // Fetch 1000 at a time
    let hasMore = true

    while (hasMore) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("toyota_microsite_users")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (usersError) {
        console.error('[Server] Users fetch error:', usersError)
        throw usersError
      }

      if (users && users.length > 0) {
        allUsers = [...allUsers, ...users]
        console.log(`[Server] Fetched page ${page + 1}: ${users.length} users (Total so far: ${allUsers.length})`)
        
        // If we got fewer records than pageSize, we've reached the end
        if (users.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    console.log(`[Server] Total users fetched: ${allUsers.length}`)

    // 2. Fetch all city data for filters and count cards
    const { data: cities, error: citiesError } = await supabaseAdmin
      .from("toyota_microsite_city_config")
      .select("*")
      .order("city_name", { ascending: true })

    console.log('[Server] Cities fetch result:', {
      count: cities?.length,
      error: citiesError?.message
    })

    if (citiesError) {
      console.error('[Server] Cities fetch error:', citiesError)
      throw citiesError
    }

    // 3. Calculate stats on the server
    const stats = calculateStats(allUsers || [])

    // 4. Pass data to the Client Component
    return (
      <DashboardWrapper
        initialUsers={allUsers || []}
        allCities={cities || []}
        stats={stats}
      />
    )
  } catch (error) {
    console.error('[Server] Dashboard error:', error)
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold text-red-500">Error fetching data</h1>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
        <p className="mt-4 text-sm text-gray-400">Check server logs for details</p>
      </div>
    )
  }
}