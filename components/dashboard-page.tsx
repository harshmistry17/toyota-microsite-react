"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Toaster, toast } from "sonner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Check,
  X,
  Send,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Users,
  Ticket,
  MessageCircle,
  ScanLine,
  LogOut,
  Mail,
} from "lucide-react"
import QRCode from "qrcode"
import {
  formatTableDateTime,
  calculateAge,
  checkAgeRange,
} from "@/lib/utils"
import { UserData, CityConfig, AgeRange, AGE_RANGES } from "@/lib/types"
import Link from "next/link"
import { auth } from "@/lib/auth"

interface DashboardPageProps {
  initialUsers: UserData[]
  allCities: CityConfig[]
  stats: AdminStats
}

export default function DashboardPage({ initialUsers, allCities }: DashboardPageProps) {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [isLoading, setIsLoading] = useState<boolean>(initialUsers.length === 0)
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [ageFilter, setAgeFilter] = useState<AgeRange>("all")
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set())

  const handleLogout = () => {
    auth.logout()
    router.push("/login")
  }

  // ✅ Fallback: Fetch users client-side if initialUsers is empty
  useEffect(() => {
    if (initialUsers.length === 0) {
      console.log('[Client] Initial users empty, fetching from client...')
      const fetchUsers = async () => {
        const { data, error } = await supabase
          .from("toyota_microsite_users")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error('[Client] Error fetching users:', error)
        } else if (data) {
          console.log('[Client] Fetched users from client:', data.length)
          setUsers(data)
        }
        setIsLoading(false)
      }
      fetchUsers()
    }
  }, [initialUsers.length])

  // ✅ Realtime listener
  useEffect(() => {
    console.log('Setting up realtime channel...')
    const channel = supabase
      .channel("toyota-microsite-users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "toyota_microsite_users" },
        (payload) => {
          console.log('Realtime event received:', payload)
          setUsers((prev) => {
            if (payload.eventType === "INSERT") return [payload.new as UserData, ...prev]
            if (payload.eventType === "UPDATE")
              return prev.map((u) => (u.uid === payload.new.uid ? (payload.new as UserData) : u))
            if (payload.eventType === "DELETE")
              return prev.filter((u) => u.uid !== payload.old.uid)
            return prev
          })
        }
      )
    //   .subscribe()
    // return () => supabase.removeChannel(channel)
    .subscribe((status) => {
      console.log('Realtime subscription status:', status)
    })
    
  return () => {
    console.log('Cleaning up realtime channel...')
    supabase.removeChannel(channel)
  }
  }, [])

  // ✅ Sort newest first
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [users]
  )

  // ✅ Filter logic
  const filteredUsers = useMemo(() => {
    return sortedUsers.filter((user) => {
      const cityMatch = cityFilter === "all" || user.city === cityFilter
      const ageMatch = checkAgeRange(user.birthdate, ageFilter)
      return cityMatch && ageMatch
    })
  }, [sortedUsers, cityFilter, ageFilter])

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const handlePageChange = (dir: "prev" | "next") => {
    setCurrentPage((prev) =>
      dir === "prev" ? Math.max(prev - 1, 1) : Math.min(prev + 1, totalPages)
    )
  }

  // ✅ Checkbox logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedUids(new Set(filteredUsers.map((u) => u.uid)))
    else setSelectedUids(new Set())
  }

  const handleSelectRow = (uid: string) => {
    setSelectedUids((prev) => {
      const updated = new Set(prev)
      updated.has(uid) ? updated.delete(uid) : updated.add(uid)
      return updated
    })
  }

  const isAllFilteredSelected =
    filteredUsers.length > 0 && selectedUids.size === filteredUsers.length

  // ✅ Generate QR
  const handleGenerateQR = async (uid: string) => {
    const qrDataUrl = await QRCode.toDataURL(uid, { width: 200, margin: 2 })
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `${uid}-qr.png`
    link.click()
  }

  // ✅ Send email to one
  const handleSendEmail = async (uid: string, name: string, email: string, city: string) => {
    const res = await fetch("/api/generate-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name, email, city }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Email sent to ${name}`, {
        position: "bottom-right",
      })
    } else {
      toast.error(`Failed: ${data.message}`, {
        position: "bottom-right",
      })
    }
  }

  // ✅ Send to selected users
  const handleSendSelected = async () => {
    if (selectedUids.size === 0) return
    const selectedUsers = filteredUsers.filter((u) => selectedUids.has(u.uid))
    for (const user of selectedUsers) {
      await handleSendEmail(user.uid, user.name, user.email, user.city || "")
    }
  }

  // ✅ Send RSVP email to selected users
  const handleSendRSVPSelected = async () => {
    if (selectedUids.size === 0) return
    const selectedUsers = filteredUsers.filter((u) => selectedUids.has(u.uid))
    for (const user of selectedUsers) {
      if (user.city) {
        await handleSendRSVPEmail(user.uid, user.name, user.email, user.city)
      }
    }
  }

  // ✅ Send RSVP email to one user
  const handleSendRSVPEmail = async (uid: string, name: string, email: string | null, city: string) => {
    if (!email) {
      toast.error("User email is missing", {
        position: "bottom-right",
      })
      return
    }
    const res = await fetch("/api/send-rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name, email, city }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`RSVP email sent to ${name}`, {
        position: "bottom-right",
      })
    } else {
      toast.error(`Failed: ${data.message}`, {
        position: "bottom-right",
      })
    }
  }

  // ✅ City-wise stats (include all live cities)
  const liveCities = useMemo(
    () => allCities.filter((c) => c?.is_live === true),
    [allCities]
  )

  const citywiseUserCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    liveCities.forEach((c) => (counts[c.city_name] = 0))
    users.forEach((u) => {
      if (u.city && counts[u.city] !== undefined) counts[u.city]++
    })
    return counts
  }, [users, liveCities])

  const citywiseRSVPCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    liveCities.forEach((c) => (counts[c.city_name] = 0))
    users.filter((u) => u.rsvp_status).forEach((u) => {
      if (u.city && counts[u.city] !== undefined) counts[u.city]++
    })
    return counts
  }, [users, liveCities])

  const totalUsers = users.length
  const totalRSVPs = users.filter((u) => u.rsvp_status).length

  // ✅ UI
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      <Toaster richColors closeButton />
      {/* Header with QR Scanner and Logout Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-red-600">Admin Dashboard</h1>
        {isLoading && (
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
            <span className="text-sm">Loading data...</span>
          </div>
        )}
        <div className="flex gap-3">
          <Link href="/qr">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ScanLine className="w-5 h-5 mr-2" />
              QR Scanner
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* === Count Cards Section === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Users Card */}
        <Card className="bg-white text-black border border-gray-300 shadow-md">
          <CardHeader className="flex items-center gap-2">
            <Users className="text-red-600 w-6 h-6" />
            <CardTitle className="text-xl font-semibold">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{totalUsers}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {liveCities.map((city) => (
                <div
                  key={city.city_name}
                  className="flex flex-col justify-center items-center bg-gray-50 border rounded-md p-2"
                >
                  <span className="text-xs font-semibold text-center">{city.city_name}</span>
                  <span className="text-lg font-bold">{citywiseUserCounts[city.city_name] ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RSVP Card */}
        <Card className="bg-white text-black border border-gray-300 shadow-md">
          <CardHeader className="flex items-center gap-2">
            <Ticket className="text-green-600 w-6 h-6" />
            <CardTitle className="text-xl font-semibold">Total RSVPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4 text-green-700">{totalRSVPs}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {liveCities.map((city) => (
                <div
                  key={city.city_name}
                  className="flex flex-col justify-center items-center bg-gray-50 border rounded-md p-2"
                >
                  <span className="text-xs font-semibold text-center">{city.city_name}</span>
                  <span className="text-lg font-bold">{citywiseRSVPCounts[city.city_name] ?? 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === Main Table === */}
      <Card className="bg-white text-black border border-gray-300 shadow-md">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-bold">User Registrations</CardTitle>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {liveCities.map((city) => (
                  <SelectItem key={city.city_name} value={city.city_name}>
                    {city.city_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageFilter} onValueChange={(v) => setAgeFilter(v as AgeRange)}>
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                {Object.keys(AGE_RANGES).map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={entriesPerPage.toString()}
              onValueChange={(v) => {
                setEntriesPerPage(Number(v))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px] border-gray-400">
                <SelectValue placeholder="Entries" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              disabled={selectedUids.size === 0}
              onClick={handleSendSelected}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Selected ({selectedUids.size})
            </Button>

            <Button
              disabled={selectedUids.size === 0}
              onClick={handleSendRSVPSelected}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send RSVP Mail ({selectedUids.size})
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 text-gray-800 font-semibold">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllFilteredSelected}
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    />
                  </TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>QR</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedUsers.map((user, index) => {
                  const isSelected = selectedUids.has(user.uid)
                  const age = calculateAge(user.birthdate)
                  return (
                    <TableRow
                      key={user.uid}
                      className={`border-b border-gray-200 ${isSelected ? "bg-gray-100" : ""}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectRow(user.uid)}
                        />
                      </TableCell>
                      <TableCell>{(currentPage - 1) * entriesPerPage + index + 1}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.city}</TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.email_status ? (
                          <Check className="text-green-600 w-5 h-5" />
                        ) : (
                          <X className="text-red-500 w-5 h-5" />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.whatsapp_status ? (
                          <MessageCircle className="text-green-600 w-5 h-5" />
                        ) : (
                          <X className="text-red-500 w-5 h-5" />
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.rsvp_status
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.rsvp_status ? "Confirmed" : "Not Yet"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateQR(user.uid)}
                          className="border-gray-400 text-black hover:bg-gray-200"
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                        </Button>
                      </TableCell>
                      <TableCell>{formatTableDateTime(user.created_at)}</TableCell>
                      <TableCell>
                        {!user.email_status && (
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() =>
                              handleSendEmail(user.uid, user.name, user.email, user.city || "")
                            }
                          >
                            <Send className="w-4 h-4 mr-2" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1}–
              {Math.min(currentPage * entriesPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange("prev")}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <span>
                Page {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange("next")}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
