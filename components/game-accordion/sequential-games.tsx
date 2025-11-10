"use client"

import { useState } from "react"
import QuizAccordion from "@/components/game-accordion/quiz-accordion"
import TwoTruthsAccordion from "@/components/game-accordion/two-truths-accordion"
import InstrumentsAccordion from "@/components/game-accordion/instruments-accordion"

export default function SequentialGames() {
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [twoTruthsCompleted, setTwoTruthsCompleted] = useState(false)
  const [instrumentsCompleted, setInstrumentsCompleted] = useState(false)

  const handleQuizComplete = (results: Record<number, boolean>) => {
    console.log("Quiz Results:", results)
    setQuizCompleted(true)
  }

  const handleTwoTruthsComplete = (results: Record<number, boolean>) => {
    console.log("Two Truths Results:", results)
    setTwoTruthsCompleted(true)
  }

  const handleInstrumentsComplete = (results: string[]) => {
    console.log("Instruments Results:", results)
    setInstrumentsCompleted(true)
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <QuizAccordion
        onComplete={handleQuizComplete}
        completed={quizCompleted}
        disabled={false} // Always available to start
      />

      <TwoTruthsAccordion
        onComplete={handleTwoTruthsComplete}
        completed={twoTruthsCompleted}
        disabled={!quizCompleted} // Only available after quiz is completed
      />

      <InstrumentsAccordion
        onComplete={handleInstrumentsComplete}
        completed={instrumentsCompleted}
        disabled={!twoTruthsCompleted} // Only available after two truths is completed
      />

      {/* Optional: Show completion message */}
      {quizCompleted && twoTruthsCompleted && instrumentsCompleted && (
        <div className="mt-8 p-6 bg-[#27c277]/20 border-2 border-[#27c277] rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-2">🎉 Congratulations!</h2>
          <p className="text-gray-300">You've completed all the Drum Tao challenges!</p>
        </div>
      )}
    </div>
  )
}