export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      toyota_microsite_city_config: {
        Row: {
          id: number
          city_name: string
          is_live: boolean
          allowed_entries: number
          venue: string | null
          start_time: string | null // e.g., "18:00:00"
          event_date: string | null // e.g., "2025-11-20"
          created_at: string
        }
        // --- FIX: Replaced Omit with manual type ---
        Insert: {
          city_name: string
          is_live?: boolean
          allowed_entries?: number
          venue?: string | null
          start_time?: string | null
          event_date?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["toyota_microsite_city_config"]["Row"]>
      }
      toyota_microsite_users: {
        Row: {
            id: number
            name: string
            uid: string
            email: string | null
            mobile: string | null
            occupation: string | null
            birthdate: string | null
            city: string | null
            car_model: string | null // 🆕 Added here
            email_status: boolean
            whatsapp_status: boolean
            rsvp_status: boolean
            is_attended_event: boolean
            is_game_played: boolean
            created_at: string
        }
        Insert: {
            name: string
            email: string | null
            mobile: string | null
            occupation: string | null
            birthdate: string | null
            city: string | null
            car_model?: string | null // 🆕 Added here
            email_status?: boolean
            whatsapp_status?: boolean
            rsvp_status?: boolean
            is_attended_event?: boolean
            is_game_played?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["toyota_microsite_users"]["Row"]>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// A simpler, more specific type for client-side use
export type CityConfig = Database["public"]["Tables"]["toyota_microsite_city_config"]["Row"]
export type UserData = Database["public"]["Tables"]["toyota_microsite_users"]["Row"]

// --- NEW TYPES FOR ADMIN DASHBOARD ---

// For the admin dashboard stats
export type CityCount = {
  [city: string]: number
}

export type AdminStats = {
  totalUsers: {
    count: number
    cities: CityCount
  }
  totalRSVPs: {
    count: number
    cities: CityCount
  }
}

// Age range filter type
export const AGE_RANGES = {
  "1990-2000": "1990-2000",
  "2000-2010": "2000-2010",
  "2010-2020": "2010-2020",
} as const

export type AgeRange = keyof typeof AGE_RANGES | "all"