"use client"

import { useState } from "react"
import QuizAccordion from "@/components/game-accordion/quiz-accordion"

export default function SequentialGames() {
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleQuizComplete = (results: Record<number, boolean>) => {
    console.log("Quiz Results:", results)
    setQuizCompleted(true)
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <QuizAccordion
        onComplete={handleQuizComplete}
        completed={quizCompleted}
        disabled={false}
      />

      {quizCompleted && (
        <div className="mt-8 p-6 bg-[#27c277]/20 border-2 border-[#27c277] rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
          <p className="text-gray-300">You've completed the quiz!</p>
        </div>
      )}
    </div>
  )
}