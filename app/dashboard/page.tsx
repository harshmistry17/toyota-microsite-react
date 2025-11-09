import DashboardWrapper from "@/components/dashboard-wrapper"
import { supabaseAdmin } from "@/lib/supabase" // <-- Import the admin client
import { calculateStats } from "@/lib/utils" // <-- Import the stats helper

// This is a Server Component
export default async function Dashboard() {
  // 1. Fetch all users
  const { data: users, error: usersError } = await supabaseAdmin
    .from("toyota_microsite_users")
    .select("*")
    .order("created_at", { ascending: false })

    // 2. Fetch all city data for filters and count cards
  const { data: cities, error: citiesError } = await supabaseAdmin
    .from("toyota_microsite_city_config")
    .select("*") // <-- fetch all fields, not just city_name
    .order("city_name", { ascending: true })

  // 3. Handle errors
  if (usersError || citiesError) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold text-red-500">Error fetching data</h1>
        <p>{usersError?.message || citiesError?.message}</p>
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