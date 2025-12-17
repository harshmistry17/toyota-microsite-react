"use client"

import { useState, useEffect } from "react"
import QuizAccordion from "@/components/game-accordion/quiz-accordion"
import type { RegistrationData } from "@/app/page"
import type { UserGameResult } from "@/lib/storage"

interface GamesPageProps {
  registrationData: RegistrationData | null
  onComplete: (results: UserGameResult) => void
}

export default function GamesPage({ registrationData, onComplete }: GamesPageProps) {
  const [gameResults, setGameResults] = useState<UserGameResult>({
    quiz: {},
  })

  const isQuizDone = Object.keys(gameResults.quiz).length > 0

  useEffect(() => {
    if (isQuizDone) {
      setTimeout(() => {
        onComplete(gameResults)
      }, 1000)
    }
  }, [isQuizDone, gameResults, onComplete])

  const handleQuizComplete = (results: Record<number, boolean>) => {
    setGameResults((prev) => ({ ...prev, quiz: results }))
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
        <img
          src="/ui/page2.png"
          alt="Drum Tao"
          className="w-full h-auto max-h-64 object-cover rounded-lg"
        />

      {/* Games Container */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-2">Ace the quiz and unlock your pass!</h1>

        <div className="space-y-4">
          <QuizAccordion
            onComplete={handleQuizComplete}
            completed={isQuizDone}
            disabled={false}
          />
        </div>
      </div>
    </div>
  )
}
