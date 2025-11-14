

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

    fetch("/api/generate-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: registrationData.uid,
        name: registrationData.name,
        email: registrationData.email,
        city: registrationData.city,
      }),
    })
      .then(res => res.json())
      .then(data => {

        console.log("API Response:", data);

        console.log(data.success);
        if (data.success) {
          console.log("Successfully generated ticket and sent email.")
        } else {
          console.error("Failed to generate ticket/send email:", data.message)
        }
      })
      .catch(error => {
        console.error("Error calling /api/generate-ticket:", error)
      })
  }, [registrationData])

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
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Arigato <br /> (Thankyou !!!!)
          </h1>
          <p className="text-black text-md mb-8 font-semibold">
            Your registration has been <br /> successfully completed. <br />Check your email/whatsapp for your buddy pass.
          </p>

          {/* CTA Button */}
          <button
            onClick={onFinish}
            className="w-[288px] mx-[10px] bg-red-600 mb-6 text-white text-base font-semibold py-3 uppercase sm:text-lg hover:bg-red-700 transition-colors"
          >
            FINISH
          </button>

        </div>

      </div>
    </div>
  )
}