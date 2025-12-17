export interface UserGameResult {
  quiz: Record<string, boolean> // question index -> is correct
}

export interface UserData {
  id: string
  name: string
  email: string
  mobile: string
  dob: string
  occupation: string
  city: string
  gameResults: UserGameResult
  timestamp: number
}

const STORAGE_KEY = "drumTaoUsers"
const CURRENT_USER_KEY = "drumTaoCurrentUser"

export const storage = {
  // Save user with game results
  saveUser: (userData: UserData) => {
    const users = storage.getAllUsers()
    const existingIndex = users.findIndex((u) => u.email === userData.email)

    if (existingIndex > -1) {
      users[existingIndex] = userData
    } else {
      users.push(userData)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  },

  // Get all users
  getAllUsers: (): UserData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  // Set current logged-in user
  setCurrentUser: (user: UserData) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  },

  // Get current logged-in user
  getCurrentUser: (): UserData | null => {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  // Clear current user (logout)
  clearCurrentUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY)
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
  },
}
