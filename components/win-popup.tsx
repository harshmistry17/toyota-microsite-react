

"use client"

import { useEffect, useRef } from "react"
import { storage, type UserData, type UserGameResult } from "@/lib/storage"
import type { RegistrationData } from "@/app/page"
// We no longer need the client-side supabase import here
// import { supabase } from "@/lib/supabase"

interface WinPopupProps {
  registrationData: RegistrationData | null
  gameResults: UserGameResult
  onFinish: () => void
  onClose: () => void
}

export default function WinPopup({ registrationData, gameResults, onFinish, onClose }: WinPopupProps) {
  const hasSentRef = useRef(false)

  useEffect(() => {
    if (!registrationData || !registrationData.uid) return

    if (hasSentRef.current) return
    hasSentRef.current = true

    const userData: UserData = {
      id: registrationData.email,
      name: registrationData.name,
      email: registrationData.email,
      mobile: registrationData.mobile,
      dob: registrationData.dob,
      occupation: registrationData.occupation,
      city: registrationData.city,
      gameResults,
      timestamp: Date.now(),
    }
    storage.saveUser(userData)

    // Ticket generation and email sending has been moved to registration phase
    // No need to call /api/generate-ticket here anymore
    console.log("Game completed. Ticket was already generated during registration.")
  }, [registrationData, gameResults])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/90">
      <div className="bg-white sm:p-8 max-w-md w-full border border-gray-800 shadow-2xl relative">

        {/* Hero Image */}
        <div className="relative mb-6">
          <div className="mb-8">
            <img
              src="/ui/page2.png"
              alt="Drum Tao"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center px-4">
          

          {/* Thank You Message */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
            Arigato <br /> <span className="text-2xl">(Thank you!!!)</span>
          </h2>

          <p className="text-black text-base sm:text-lg mb-8 font-semibold leading-relaxed">
            Your registration has been <br /> successfully completed. 
          </p>
<p className="text-black text-base sm:text-lg mb-8 font-bold leading-relaxed">Check your mail (Inbox and Spam folder) / WhatsApp for the buddy passes</p>
          {/* CTA Button */}
          <button
            onClick={onFinish}
            className="w-[288px] mx-[10px] bg-red-600 mb-6 text-white text-base font-semibold py-3 uppercase sm:text-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            FINISH
          </button>

        </div>

      </div>
    </div>
  )
}