
//dashboard-page.tsx
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
import { Input } from "@/components/ui/input"
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
  Search,
  Download,
  RefreshCcw,
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

type NormalizedRsvpStatus = "not_sent" | "sent" | "confirmed"

const normalizeRsvpStatus = (status: UserData["rsvp_status"]): NormalizedRsvpStatus => {
  if (status === "confirmed" || status === true) return "confirmed"
  if (status === "sent") return "sent"
  return "not_sent"
}

const rsvpStatusLabels: Record<NormalizedRsvpStatus, string> = {
  not_sent: "Not Sent",
  sent: "Sent",
  confirmed: "Confirmed",
}

const rsvpBadgeClasses: Record<NormalizedRsvpStatus, string> = {
  not_sent: "bg-yellow-100 text-yellow-700",
  sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
}

export default function DashboardPage({ initialUsers, allCities }: DashboardPageProps) {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [isLoading, setIsLoading] = useState<boolean>(initialUsers.length === 0)
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [ageFilter, setAgeFilter] = useState<AgeRange>("all")
  const [emailStatusFilter, setEmailStatusFilter] = useState<string>("all")
  const [resendStatusFilter, setResendStatusFilter] = useState<string>("all")
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState<string>("all")
  const [whatsappStatusFilter, setWhatsappStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
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

  // ✅ Enhanced Filter logic with search, email status, and whatsapp status
  // DATE FILTER IMPLEMENTATION
  // Step 1: Add state variables (after other filter states, around line 60)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Step 2: Update filteredUsers logic (around line 170)
  // FIND the filteredUsers useMemo and ADD date filter:
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase()
    return sortedUsers.filter((user) => {
      // Existing filters...
      const cityMatch = cityFilter === "all" || user.city === cityFilter
      const ageMatch = checkAgeRange(user.birthdate, ageFilter)
      const emailMatch = emailStatusFilter === "all" || 
        (emailStatusFilter === "sent" && user.email_status) ||
        (emailStatusFilter === "not_sent" && !user.email_status)
      const resendMatch = resendStatusFilter === "all" ||
        (resendStatusFilter === "resent" && user.resend_status) ||
        (resendStatusFilter === "not_resent" && !user.resend_status)
      const normalizedRsvp = normalizeRsvpStatus(user.rsvp_status)
      const rsvpMatch =
        rsvpStatusFilter === "all" ||
        normalizedRsvp === rsvpStatusFilter ||
        (rsvpStatusFilter === "sent" && normalizedRsvp === "confirmed")
      const whatsappMatch = whatsappStatusFilter === "all" ||
        (whatsappStatusFilter === "sent" && user.whatsapp_status) ||
        (whatsappStatusFilter === "not_sent" && !user.whatsapp_status)
      const searchMatch = searchQuery === "" || 
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.mobile?.includes(searchQuery) ||
        user.car_model?.toLowerCase().includes(normalizedSearch) ||
        user.occupation?.toLowerCase().includes(normalizedSearch)
      
      // ✅ NEW: Date filter
      const userDate = new Date(user.created_at).setHours(0, 0, 0, 0)
      const dateMatch = 
        (!startDate || userDate >= new Date(startDate).setHours(0, 0, 0, 0)) &&
        (!endDate || userDate <= new Date(endDate).setHours(23, 59, 59, 999))
      
      return cityMatch && ageMatch && emailMatch && resendMatch && rsvpMatch && whatsappMatch && searchMatch && dateMatch
    })
  }, [sortedUsers, cityFilter, ageFilter, emailStatusFilter, resendStatusFilter, rsvpStatusFilter, whatsappStatusFilter, searchQuery, startDate, endDate])

  // Step 3: Update useEffect dependencies for page reset (around line 210)
  // FIND THIS:
  useEffect(() => {
    setCurrentPage(1)
  }, [cityFilter, ageFilter, emailStatusFilter, resendStatusFilter, rsvpStatusFilter, whatsappStatusFilter, searchQuery, entriesPerPage])

  // REPLACE WITH THIS:
  useEffect(() => {
    setCurrentPage(1)
  }, [cityFilter, ageFilter, emailStatusFilter, resendStatusFilter, rsvpStatusFilter, whatsappStatusFilter, searchQuery, entriesPerPage, startDate, endDate])

  // Step 4: Add date picker inputs in the UI (after the search bar, around line 455)
  // ADD THIS after the Search Bar div:

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [cityFilter, ageFilter, emailStatusFilter, resendStatusFilter, rsvpStatusFilter, whatsappStatusFilter, searchQuery, entriesPerPage])

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

  // ✅ Quick select function
  const handleQuickSelect = (count: number) => {
    const toSelect = filteredUsers.slice(0, count).map(u => u.uid)
    setSelectedUids(new Set(toSelect))
    toast.success(`Selected ${toSelect.length} users`, {
      position: "bottom-right",
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

  const handleResendEmail = async (uid: string, name: string, email: string | null, city: string) => {
    if (!email) {
      toast.error("User email is missing", {
        position: "bottom-right",
      })
      return
    }
    const res = await fetch("/api/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name, email, city }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Resent email to ${name}`, {
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

  const handleResendSelected = async () => {
    if (selectedUids.size === 0) return
    const selectedUsers = filteredUsers.filter((u) => selectedUids.has(u.uid))
    for (const user of selectedUsers) {
      await handleResendEmail(user.uid, user.name, user.email, user.city || "")
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

  // ✅ Export data to CSV
  const handleExportData = () => {
    // Use filtered users for export
    const dataToExport = filteredUsers.length > 0 ? filteredUsers : users
    
    const supabaseColumns = [
      { header: "ID", value: (user: UserData) => user.id },
      { header: "UID", value: (user: UserData) => user.uid },
      { header: "Name", value: (user: UserData) => user.name },
      { header: "Email", value: (user: UserData) => user.email || "" },
      { header: "Mobile", value: (user: UserData) => user.mobile || "" },
      { header: "Occupation", value: (user: UserData) => user.occupation || "" },
      { header: "Birthdate", value: (user: UserData) => user.birthdate || "" },
      { header: "City", value: (user: UserData) => user.city || "" },
      { header: "Car Model", value: (user: UserData) => user.car_model || "" },
      { header: "Image Link", value: (user: UserData) => user.image_link || "" },
      { header: "Email Status", value: (user: UserData) => (user.email_status ? "Sent" : "Not Sent") },
      { header: "Resend Status", value: (user: UserData) => (user.resend_status ? "Resent" : "Not Resent") },
      { header: "WhatsApp Status", value: (user: UserData) => (user.whatsapp_status ? "Sent" : "Not Sent") },
      { header: "RSVP Status", value: (user: UserData) => rsvpStatusLabels[normalizeRsvpStatus(user.rsvp_status)] },
      { header: "Attended Event", value: (user: UserData) => (user.is_attended_event ? "Yes" : "No") },
      { header: "Game Played", value: (user: UserData) => (user.is_game_played ? "Yes" : "No") },
      { header: "Registered At", value: (user: UserData) => formatTableDateTime(user.created_at) },
    ]

    const derivedColumns = [
      { header: "Age", value: (user: UserData) => calculateAge(user.birthdate) ?? "" },
    ]

    const exportColumns = [...supabaseColumns, ...derivedColumns]
    const headers = exportColumns.map((col) => col.header)

    const rows = dataToExport.map((user) =>
      exportColumns.map((col) => col.value(user))
    )
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          // Escape cells containing commas or quotes
          const cellStr = String(cell)
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(",")
      )
    ].join("\n")
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `toyota-users-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${dataToExport.length} users to CSV`, {
      position: "bottom-right",
    })
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
    users
      .filter((u) => normalizeRsvpStatus(u.rsvp_status) === "confirmed")
      .forEach((u) => {
        if (u.city && counts[u.city] !== undefined) counts[u.city]++
      })
    return counts
  }, [users, liveCities])

  const totalUsers = users.length
  const totalRSVPs = users.filter((u) => normalizeRsvpStatus(u.rsvp_status) === "confirmed").length

  
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
            <CardTitle className="text-xl font-semibold">Total RSVPs Confirmed</CardTitle>
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
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="text-2xl font-bold">User Registrations</CardTitle>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-400"
            />
          </div>

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

            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-gray-400 w-[160px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-gray-400 w-[160px]"
                />
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="border-gray-400 text-gray-700 hover:bg-gray-100"
                >
                  Clear Dates
                </Button>
              )}
            </div>
            
            <Select value={emailStatusFilter} onValueChange={setEmailStatusFilter}>
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="Email Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Email)</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="not_sent">Not Sent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resendStatusFilter} onValueChange={setResendStatusFilter}>
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="Resend Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Resend)</SelectItem>
                <SelectItem value="resent">Resent</SelectItem>
                <SelectItem value="not_resent">Not Resent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={rsvpStatusFilter} onValueChange={setRsvpStatusFilter}>
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="RSVP Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (RSVP)</SelectItem>
                <SelectItem value="not_sent">Not Sent</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={whatsappStatusFilter} onValueChange={setWhatsappStatusFilter}>
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="WhatsApp Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Whatsapp)</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="not_sent">Not Sent</SelectItem>
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
                {[5, 10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => handleQuickSelect(Number(value))}
            >
              <SelectTrigger className="w-[160px] border-gray-400">
                <SelectValue placeholder="Quick Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Select First 10</SelectItem>
                <SelectItem value="50">Select First 50</SelectItem>
                <SelectItem value="100">Select First 100</SelectItem>
                <SelectItem value={filteredUsers.length.toString()}>Select All ({filteredUsers.length})</SelectItem>
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

            <Button
              disabled={selectedUids.size === 0}
              onClick={handleResendSelected}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Resend Email ({selectedUids.size})
            </Button>

            <Button
              onClick={handleExportData}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
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
                  <TableHead>Car Model</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Resend Status</TableHead>
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
                  const rsvpStatus = normalizeRsvpStatus(user.rsvp_status)
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
                      <TableCell>{user.car_model || "-"}</TableCell>
                      <TableCell>{user.occupation || "-"}</TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.mobile || "-"}</TableCell>
                      <TableCell>
                        {user.email_status ? (
                          <Check className="text-green-600 w-5 h-5" />
                        ) : (
                          <X className="text-red-500 w-5 h-5" />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.resend_status ? (
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
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${rsvpBadgeClasses[rsvpStatus]}`}
                        >
                          {rsvpStatusLabels[rsvpStatus]}
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
              Showing {filteredUsers.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}–
              {Math.min(currentPage * entriesPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} entries (Total: {totalUsers})
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
