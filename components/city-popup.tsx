

"use client"

import Image from "next/image"
import { CityConfig } from "@/lib/types"
import { format } from "date-fns" // Using date-fns for formatting

interface CityPopupProps {
  cityConfig: CityConfig // Use the full CityConfig object
  onClose: () => void
  onPlay: () => void
}

// Helper function to format time (e.g., "18:00:00" -> "6:00pm")
const formatTime = (timeString: string | null): string => {
  if (!timeString) return "TBD"
  const [hours, minutes] = timeString.split(":")
  const date = new Date()
  date.setHours(parseInt(hours, 10))
  date.setMinutes(parseInt(minutes, 10))
  return format(date, "h:mma") // e.g., "6:00 PM"
}

// Helper function to format date (e.g., "2025-11-20" -> { date: "20th November 2025", day: "Thursday" })
const formatDateInfo = (dateString: string | null) => {
  if (!dateString) return { date: "Date TBD", day: "Day TBD" }
  const date = new Date(dateString)
  return {
    date: format(date, "do MMMM yyyy,"), // "20th November 2025,"
    day: format(date, "EEEE"), // "Thursday"
  }
}

export default function CityPopup({ cityConfig, onClose, onPlay }: CityPopupProps) {
  const { city_name, venue, event_date, start_time } = cityConfig
  const { date, day } = formatDateInfo(event_date)
  const gateTime = formatTime(start_time)
  const isVijayawada = city_name.trim().toLowerCase() === "vijayawada"
  
  // Format venue text for display
  const formattedVenue = venue ? venue.replace(/\\n/g, "\n") : "Venue TBD"

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/70">
      <div className="bg-white sm:p-8 max-w-md w-full border border-gray-800 shadow-2xl relative">

        {/* Image Section with Close Button */}
        <div className="relative mb-6">
          <Image
            src={`/cover/${city_name.toLowerCase()}.png`} // Dynamic src
            alt="Event Banner"
            width={600}
            height={300}
            className="w-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 transition-transform hover:scale-110"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" fill="#FF0000" />
              <path
                d="M26 16C26 10.4771 21.5228 6 16 6C10.4771 6 6 10.4771 6 16C6 21.5228 10.4771 26 16 26C21.5228 26 26 21.5228 26 16Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.9994 19L13 13M13.0006 19L19 13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl text-center mb-3 text-black font-bold">DRUM TAO</h1>

        {/* City Badge */}
        <div className="text-red-500 font-bold py-2 px-0 text-center mb-3 text-xl">
          {city_name.toUpperCase()}
        </div>

        {/* Date Info */}
        <div className="text-center mb-3">
          <p className="text-black font-semibold text-lg sm:text-base">{date}</p>
          <p className="text-black font-semibold text-lg sm:text-base">{day}</p>
        </div>

        {/* Venue */}
        <div className="relative m-8 text-center">
          {/* Title overlay */}
          <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-lg text-black font-bold">
            Venue
          </p>

          {/* Bordered venue box */}
          <div className="border-3 border-red-500 p-4">
            <p className="text-black text-xl font-bold sm:text-base leading-relaxed whitespace-pre-line">
              {formattedVenue}
            </p>
          </div>
        </div>

        {/* Gates Open Time */}
        <div className="text-center mb-6">
          <p className="text-black font-bold text-xl">Show begins</p>
          <p className="text-black text-xl font-bold lowercase">@ {gateTime}</p>
        </div>

        {/* Play Button or Closed Message */}
        {isVijayawada ? (
          <div className="flex justify-center mb-8 px-4">
            <div className="w-full border border-red-600 bg-gray-100 px-4 py-6 text-center text-black">
              <p className="text-2xl font-bold text-red-600">Arigato!!</p>
              <p className="mt-3 text-base font-semibold">
                Registrations for Vijayawada have closed. Thank you for the overwhelming response.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-8">
            <button
              onClick={onPlay}
              className="w-[80vw] bg-red-600 text-white py-3 sm:py-4 text-base font-semibold uppercase sm:text-lg hover:bg-red-700 transition-colors"
            >
              Register Now
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
