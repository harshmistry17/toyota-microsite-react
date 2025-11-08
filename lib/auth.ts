const AUTH_KEY = "drumTaoAuth"

export const auth = {
  // Login with credentials
  login: (userId: string, password: string): boolean => {
    if (userId === "admin" && password === "root") {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        userId: "admin",
        timestamp: Date.now()
      }))
      return true
    }
    return false
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    try {
      const data = localStorage.getItem(AUTH_KEY)
      if (!data) return false

      const auth = JSON.parse(data)
      // Check if session is still valid (e.g., within 24 hours)
      const isValid = Date.now() - auth.timestamp < 24 * 60 * 60 * 1000

      if (!isValid) {
        localStorage.removeItem(AUTH_KEY)
        return false
      }

      return auth.userId === "admin"
    } catch {
      return false
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(AUTH_KEY)
  }
}
