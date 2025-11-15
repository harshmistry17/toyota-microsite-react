import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AgeRange, AdminStats, UserData } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null
  try {
    const birthDate = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  } catch (e) {
    return null
  }
}

export function checkAgeRange(birthdate: string | null, range: AgeRange): boolean {
  if (range === "all" || !birthdate) return true
  
  try {
    // Note: The range 2010-2020 means birth year >= 2010 and < 2020
    const birthYear = new Date(birthdate).getFullYear()
    const [start, end] = range.split("-").map(Number)
    return birthYear >= start && birthYear < end
  } catch (e) {
    return false
  }
}

export function formatTableDate(dateString: string | null): string {
    if (!dateString) return "N/A"
    try {
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) // dd/mm/yyyy
    } catch (e) {
        return "Invalid Date"
    }
}

export function formatTableDateTime(dateString: string | null): string {
    if (!dateString) return "N/A"
    try {
        return new Date(dateString).toLocaleString("en-GB", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) // dd/mm/yyyy, hh:mm
    } catch (e) {
        return "Invalid Date"
    }
}

// --- MOVED FUNCTION ---
// Helper function to process stats
const isRsvpConfirmed = (status: UserData["rsvp_status"]) =>
  status === "confirmed" || status === true

export const calculateStats = (users: UserData[]): AdminStats => {
  const stats: AdminStats = {
    totalUsers: { count: 0, cities: {} },
    totalRSVPs: { count: 0, cities: {} },
  }

  users.forEach(user => {
    const city = user.city || "Unknown"

    // Total users
    stats.totalUsers.count++
    stats.totalUsers.cities[city] = (stats.totalUsers.cities[city] || 0) + 1

    // RSVP users
    if (isRsvpConfirmed(user.rsvp_status)) {
      stats.totalRSVPs.count++
      stats.totalRSVPs.cities[city] = (stats.totalRSVPs.cities[city] || 0) + 1
    }
  })

  return stats
}
