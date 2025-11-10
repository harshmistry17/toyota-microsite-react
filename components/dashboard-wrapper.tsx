"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import DashboardPage from "@/components/dashboard-page"
import { UserData, CityConfig } from "@/lib/types"

interface DashboardWrapperProps {
  initialUsers: UserData[]
  allCities: CityConfig[]
  stats: AdminStats
}

interface AdminStats {
  totalUsers: number
  totalRSVPs: number
  totalGamesPlayed: number
}

export default function DashboardWrapper({ initialUsers, allCities, stats }: DashboardWrapperProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication on mount
    if (!auth.isAuthenticated()) {
      router.push("/login")
    } else {
      setIsChecking(false)
    }
  }, [router])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <DashboardPage initialUsers={initialUsers} allCities={allCities} stats={stats} />
}
