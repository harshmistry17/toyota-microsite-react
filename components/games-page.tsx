"use client"

import { useState, useEffect } from "react"
import QuizAccordion from "@/components/game-accordion/quiz-accordion"
import TwoTruthsAccordion from "@/components/game-accordion/two-truths-accordion"
import InstrumentsAccordion from "@/components/game-accordion/instruments-accordion"
import type { RegistrationData } from "@/app/page"
import type { UserGameResult } from "@/lib/storage"

interface GamesPageProps {
  registrationData: RegistrationData | null
  onComplete: (results: UserGameResult) => void
}

export default function GamesPage({ registrationData, onComplete }: GamesPageProps) {
  const [gameResults, setGameResults] = useState<UserGameResult>({
    quiz: {},
    twoTruths: {},
    instruments: [],
  })

  const isQuizDone = Object.keys(gameResults.quiz).length > 0
  const isTwoTruthsDone = Object.keys(gameResults.twoTruths).length > 0
  const isInstrumentsDone = gameResults.instruments.length > 0

  useEffect(() => {
    if (isQuizDone && isTwoTruthsDone && isInstrumentsDone) {
      setTimeout(() => {
        onComplete(gameResults)
      }, 1000)
    }
  }, [isQuizDone, isTwoTruthsDone, isInstrumentsDone, gameResults, onComplete])

  const handleQuizComplete = (results: Record<number, boolean>) => {
    setGameResults((prev) => ({ ...prev, quiz: results }))
  }

  const handleTwoTruthsComplete = (results: Record<number, boolean>) => {
    setGameResults((prev) => ({ ...prev, twoTruths: results }))
  }

  const handleInstrumentsComplete = (results: string[]) => {
    setGameResults((prev) => ({ ...prev, instruments: results }))
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
          <TwoTruthsAccordion
            onComplete={handleTwoTruthsComplete}
            completed={isTwoTruthsDone}
            disabled={!isQuizDone}
          />
          <InstrumentsAccordion
            onComplete={handleInstrumentsComplete}
            completed={isInstrumentsDone}
            disabled={!isTwoTruthsDone}
          />
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 flex justify-between text-sm text-gray-400">
          <span className={isQuizDone ? "text-green-400" : ""}>Quiz {isQuizDone ? "✓" : "○"}</span>
          <span className={isTwoTruthsDone ? "text-green-400" : ""}>Two Truths {isTwoTruthsDone ? "✓" : "○"}</span>
          <span className={isInstrumentsDone ? "text-green-400" : ""}>Instruments {isInstrumentsDone ? "✓" : "○"}</span>
        </div>
      </div>
    </div>
  )
}
