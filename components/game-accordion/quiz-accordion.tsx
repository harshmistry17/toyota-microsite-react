"use client"

import { useState, useEffect } from "react"
import GameAccordion from "@/components/game-accordion/game-accordion"

interface QuizAccordionProps {
  onComplete: (results: Record<number, boolean>) => void
  completed: boolean
}

const quizQuestions = [
  {
    id: 1,
    question: "Drum Tao is a world-renowned ensemble from which country?",
    options: [
      { id: "a", text: "China", correct: false },
      { id: "b", text: "Japan", correct: true },
      { id: "c", text: "Korea", correct: false },
      { id: "d", text: "Thailand", correct: false },
    ],
  },
  {
    id: 2,
    question: "What traditional Japanese instrument is Drum Tao best known for?",
    options: [
      { id: "a", text: "Shamisen", correct: false },
      { id: "b", text: "Taiko Drum", correct: true },
      { id: "c", text: "Koto", correct: false },
      { id: "d", text: "Shakuhachi", correct: false },
    ],
  },
  {
    id: 3,
    question: "Drum Tao performances combine rhythm with which other art forms?",
    options: [
      { id: "a", text: "Martial arts, dance, and theatre", correct: true },
      { id: "b", text: "Painting and calligraphy", correct: false },
      { id: "c", text: "Origami and Ikebana", correct: false },
      { id: "d", text: "Kabuki acting", correct: false },
    ],
  },
  {
    id: 4,
    question: 'What does the word "Tao" mean in Japanese?',
    options: [
      { id: "a", text: "Strength", correct: false },
      { id: "b", text: "Path / Way", correct: true },
      { id: "c", text: "Drum", correct: false },
      { id: "d", text: "Rhythm", correct: false },
    ],
  },
]

export default function QuizAccordion({ onComplete, completed }: QuizAccordionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})

  useEffect(() => {
    const allAnswered = selectedAnswers && Object.keys(selectedAnswers).length === quizQuestions.length
    if (allAnswered && !completed) {
      const results = quizQuestions.reduce(
        (acc, q) => {
          const selectedOption = selectedAnswers[q.id]
          const option = q.options.find((opt) => opt.id === selectedOption)
          acc[q.id] = option?.correct || false
          return acc
        },
        {} as Record<number, boolean>,
      )
      onComplete(results)
    }
  }, [selectedAnswers, completed, onComplete])

  const handleSelectAnswer = (questionId: number, optionId: string) => {
    // Only allow selection if this question hasn't been answered yet
    if (!selectedAnswers[questionId]) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    }
  }

  const allAnswered = selectedAnswers && Object.keys(selectedAnswers).length === quizQuestions.length

  return (
    <GameAccordion title="Drum Tao Quiz" completed={completed} defaultExpanded={true}>
      <div className="space-y-6">
        {quizQuestions.map((question, index) => (
          <div key={question.id} className="mt-2">
            <h3 className="text-lg font-semibold mb-4">
              {index + 1}. {question.question}
            </h3>

            <div className="space-y-2">
              {question.options.map((option) => {
                const isSelected = selectedAnswers[question.id] === option.id
                const isCorrect = option.correct
                const isAnswered = selectedAnswers[question.id] !== undefined

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAnswer(question.id, option.id)}
                    disabled={isAnswered}
                    className={`w-full p-2 border-2 text-left font-medium transition-all ${
                      isSelected && isCorrect
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : isSelected && !isCorrect
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : isSelected
                            ? "border-red-500 bg-red-500/10"
                            : "border-gray-700 hover:border-gray-600 cursor-pointer disabled:opacity-75"
                    } ${isAnswered && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="flex items-center justify-between">
                      <span>
                        {option.id.toUpperCase()}) {option.text}
                      </span>
                      {isAnswered && isCorrect && (
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </GameAccordion>
  )
}