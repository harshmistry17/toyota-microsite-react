"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

export default function QRScannerPage() {
  const router = useRouter()
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
    userName?: string
  } | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessing = useRef(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return

    const initScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader")
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 30, // Increased FPS for faster scanning
            qrbox: 280, // Single camera with slightly larger box
          },
          async (decodedText) => {
            // Prevent multiple scans
            if (isProcessing.current) return
            isProcessing.current = true

            // Validate the scanned UID
            await validateUID(decodedText)

            // Reset processing after 2 seconds to allow next scan
            setTimeout(() => {
              isProcessing.current = false
            }, 2000)
          },
          (errorMessage) => {
            // Ignore error messages during scanning
          }
        )

        setIsScanning(true)
      } catch (err) {
        console.error("Error starting scanner:", err)
        setNotification({
          type: "error",
          message: "Failed to start camera. Please check permissions.",
        })
      }
    }

    initScanner()

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear()
          })
          .catch((err) => console.error("Error stopping scanner:", err))
      }
    }
  }, [isAuthenticated])

  const validateUID = async (uid: string) => {
    try {
      // Query Supabase to check if UID exists
      const { data, error: dbError } = await supabase
        .from("toyota_microsite_users")
        .select("uid, name, is_attended_event")
        .eq("uid", uid)
        .single()

      if (dbError || !data) {
        setNotification({
          type: "error",
          message: "Invalid QR Code. User not found.",
        })
      } else {
        // Update is_attended_event to true
        const { error: updateError } = await supabase
          .from("toyota_microsite_users")
          .update({ is_attended_event: true })
          .eq("uid", uid)

        if (updateError) {
          console.error("Error updating attendance:", updateError)
        }

        setNotification({
          type: "success",
          message: "Welcome!",
          userName: data.name,
        })
      }

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    } catch (err) {
      console.error("Error validating UID:", err)
      setNotification({
        type: "error",
        message: "Failed to validate QR code.",
      })

      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  const handleClose = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear()
          router.push("/dashboard")
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err)
          router.push("/dashboard")
        })
    } else {
      router.push("/dashboard")
    }
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Notification - Top Left */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 sm:right-auto z-[60] rounded-lg p-3 sm:p-4 shadow-lg border-2 max-w-sm animate-in slide-in-from-left ${
            notification.type === "success"
              ? "bg-green-600 border-green-400"
              : "bg-red-600 border-red-400"
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-white font-bold text-base sm:text-lg">{notification.message}</p>
              {notification.userName && (
                <p className="text-white text-sm sm:text-base mt-1">{notification.userName}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">QR Code Scanner</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Scanner Area - Full Screen */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-900">
        <div className="mb-6 text-center">
          <p className="text-white text-lg sm:text-xl font-semibold">Point camera at QR code</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Scanner is ready and active</p>
        </div>

        <div
          id="qr-reader"
          className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-lg overflow-hidden shadow-2xl"
        />
      </div>
    </div>
  )
}
