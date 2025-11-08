"use client"

import type React from "react"

import { useState } from "react"

interface GameAccordionProps {
  title: string
  children: React.ReactNode
  completed: boolean
  onComplete?: () => void
  defaultExpanded?: boolean // Added prop
}

export default function GameAccordion({
  title,
  children,
  completed,
  onComplete,
  defaultExpanded = false, // Added prop with default
}: GameAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded) // Set initial state

  return (
    <div
      className={`overflow-hidden transition-all ${
        completed
          ? "border-[#27c277] bg-[#27c277]/10" // Changed color for completed
          : "border-[#27c277]/25 bg-[#27c277]/25" // Changed color for inactive
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 font-bold text-lg transition-colors ${
          completed
            ? "bg-[#27c277] hover:bg-[#27c277]/90 text-white" // Changed color for completed
            : "bg-transparent hover:bg-[#27c277]/40 text-white" // Changed color for inactive
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

      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  )
}