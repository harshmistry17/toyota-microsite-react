

"use client"

import type React from "react"

import { useState } from "react"

interface GameAccordionProps {
  title: string
  children: React.ReactNode
  completed: boolean
  onComplete?: () => void
  defaultExpanded?: boolean
  disabled?: boolean // Added prop for locking accordion
}

export default function GameAccordion({
  title,
  children,
  completed,
  onComplete,
  defaultExpanded = false,
  disabled = false, // Added prop with default
}: GameAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      className={`overflow-hidden transition-all border-2 ${
        completed
          ? "border-[#27c277]" // Green border for completed
          : disabled
            ? "border-[#27c277]/10" // Very light border for disabled
            : "border-[#27c277]/25" // Light border for inactive but available
      }`}
    >
      <button
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 font-bold text-lg transition-colors ${
          completed
            ? "bg-[#27c277] hover:bg-[#27c277]/90 text-white" // Green background for completed
            : disabled
              ? "bg-[#27c277]/10 text-gray-500 cursor-not-allowed" // Very light green for disabled
              : "bg-[#27c277]/25 hover:bg-[#27c277]/40 text-white cursor-pointer" // Light green for active
        }`}
      >
        <span className="flex items-center gap-3">
          {completed && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {disabled && !completed && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {title}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isExpanded && <div className="p-4 bg-transparent">{children}</div>}
    </div>
  )
}