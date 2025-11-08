"use client"

import type React from "react"

import { useState } from "react"
import { storage } from "@/lib/storage"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [userId, setUserId] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Admin credentials: id: admin, code: root
    if (userId === "admin" && code === "root") {
      const adminUser = {
        id: "admin",
        name: "Admin",
        email: "admin@drumtao.com",
        mobile: "",
        dob: "",
        occupation: "",
        city: "",
        gameResults: { quiz: {}, twoTruths: {}, instruments: [] },
        timestamp: Date.now(),
      }
      storage.setCurrentUser(adminUser)
      onLoginSuccess()
    } else {
      setError("Invalid credentials. Use id: admin, code: root")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Admin Login</h1>
          <p className="text-center text-gray-400 mb-8">View user registrations and game results</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">Demo credentials: admin / root</p>
        </div>
      </div>
    </div>
  )
}
