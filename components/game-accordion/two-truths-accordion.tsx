// "use client"

// import { useState, useEffect } from "react"
// import GameAccordion from "@/components/game-accordion/game-accordion"

// interface TwoTruthsAccordionProps {
//   onComplete: (results: Record<number, boolean>) => void
//   completed: boolean
// }

// const truthSets = [
//   {
//     id: 1,
//     statements: [
//       {
//         id: "a",
//         text: "Drum Tao have performed in over 25 countries",
//         isLie: false,
//       },
//       { id: "b", text: "They started as a rock band", isLie: true },
//       {
//         id: "c",
//         text: "Their shows mix martial arts & dance",
//         isLie: false,
//       },
//     ],
//   },
//   {
//     id: 2,
//     statements: [
//       {
//         id: "a",
//         text: "This is Toyota's first Drum Tao event in India",
//         isLie: false,
//       },
//       { id: "b", text: 'Drum Tao means "Drum Way" in Japanese', isLie: true },
//       {
//         id: "c",
//         text: "They only perform in Japan",
//         isLie: true,
//       },
//     ],
//   },
// ]

// export default function TwoTruthsAccordion({ onComplete, completed }: TwoTruthsAccordionProps) {
//   const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
//   const [revealed, setRevealed] = useState<Set<number>>(new Set())

//   useEffect(() => {
//     const allAnswered = truthSets.every((set) => revealed.has(set.id))
//     if (allAnswered && !completed) {
//       const results = truthSets.reduce(
//         (acc, set) => {
//           const selectedId = selectedAnswers[set.id]
//           const statement = set.statements.find((s) => s.id === selectedId)
//           acc[set.id] = statement?.isLie === true
//           return acc
//         },
//         {} as Record<number, boolean>,
//       )
//       onComplete(results)
//     }
//   }, [revealed, selectedAnswers, completed, onComplete])

//   const handleSelectLie = (setId: number, statementId: string) => {
//     const selected = selectedAnswers[setId]
//     if (!selected) {
//       setSelectedAnswers((prev) => ({ ...prev, [setId]: statementId }))
//       setRevealed((prev) => new Set([...prev, setId]))
//     }
//   }

//   const allAnswered = truthSets.every((set) => revealed.has(set.id))

//   return (
//     <GameAccordion title="Two Truths & a Lie" completed={completed}>
//       <div className="space-y-6">
//         {truthSets.map((set) => (
//           <div key={set.id} className="mt-2">
//             <p className="font-bold text-white mb-4">Spot the lie</p>
//             <div className="space-y-2">
//               {set.statements.map((statement) => {
//                 const isSelected = selectedAnswers[set.id] === statement.id
//                 const isRevealed = revealed.has(set.id)
//                 const isCorrect = statement.isLie

//                 return (
//                   <button
//                     key={statement.id}
//                     onClick={() => handleSelectLie(set.id, statement.id)}
//                     disabled={isRevealed}
//                     className={`w-full p-2 border-2 text-left font-medium transition-all flex items-center justify-between ${
//                       isSelected && isRevealed && isCorrect
//                         ? "border-green-500 bg-green-500/10 text-green-400"
//                         : isSelected && isRevealed && !isCorrect
//                           ? "border-red-500 bg-red-500/10 text-red-400"
//                           : isSelected
//                             ? "border-blue-500 bg-blue-500/10 text-blue-400"
//                             : "border-gray-700 hover:border-gray-600"
//                     } ${isRevealed && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
//                   >
//                     <span className="flex items-center">
//                       <div className="text-sm">{statement.text}</div>
//                     </span>
//                     {isRevealed && isSelected && isCorrect && (
//                       <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path
//                           fillRule="evenodd"
//                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                     {isRevealed && isSelected && !isCorrect && (
//                       <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path
//                           fillRule="evenodd"
//                           d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//         ))}
//       </div>
//     </GameAccordion>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import GameAccordion from "@/components/game-accordion/game-accordion"

interface TwoTruthsAccordionProps {
  onComplete: (results: Record<number, boolean>) => void
  completed: boolean
  disabled?: boolean
}

const truthSets = [
  {
    id: 1,
    statements: [
      {
        id: "a",
        text: "Drum Tao have performed in over 25 countries",
        isLie: false,
      },
      { id: "b", text: "They started as a rock band", isLie: true },
      {
        id: "c",
        text: "Their shows mix martial arts & dance",
        isLie: false,
      },
    ],
  },
  {
    id: 2,
    statements: [
      {
        id: "a",
        text: "This is Toyota's first Drum Tao event in India",
        isLie: false,
      },
      { id: "b", text: 'Drum Tao means "Drum Way" in Japanese', isLie: true },
      {
        id: "c",
        text: "They only perform in Japan",
        isLie: true,
      },
    ],
  },
]

export default function TwoTruthsAccordion({ onComplete, completed, disabled = false }: TwoTruthsAccordionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  useEffect(() => {
    const allAnswered = truthSets.every((set) => revealed.has(set.id))
    if (allAnswered && !completed) {
      const results = truthSets.reduce(
        (acc, set) => {
          const selectedId = selectedAnswers[set.id]
          const statement = set.statements.find((s) => s.id === selectedId)
          acc[set.id] = statement?.isLie === true
          return acc
        },
        {} as Record<number, boolean>,
      )
      // Small delay before calling onComplete
      setTimeout(() => {
        onComplete(results)
      }, 500)
    }
  }, [revealed, selectedAnswers, completed, onComplete])

  const handleSelectLie = (setId: number, statementId: string) => {
    const selected = selectedAnswers[setId]
    if (!selected) {
      setSelectedAnswers((prev) => ({ ...prev, [setId]: statementId }))
      setRevealed((prev) => new Set([...prev, setId]))
    }
  }

  const allAnswered = truthSets.every((set) => revealed.has(set.id))

  return (
    <GameAccordion title="Two Truths & a Lie" completed={completed} defaultExpanded={!disabled} disabled={disabled}>
      <div className="space-y-6">
        {truthSets.map((set) => (
          <div key={set.id} className="mt-2">
            <p className="font-bold text-white mb-4">Spot the lie</p>
            <div className="space-y-2">
              {set.statements.map((statement) => {
                const isSelected = selectedAnswers[set.id] === statement.id
                const isRevealed = revealed.has(set.id)
                const isCorrect = statement.isLie

                return (
                  <button
                    key={statement.id}
                    onClick={() => handleSelectLie(set.id, statement.id)}
                    disabled={isRevealed}
                    className={`w-full p-2 border-2 text-left font-medium transition-all flex items-center justify-between ${
                      isSelected && isRevealed && isCorrect
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : isSelected && isRevealed && !isCorrect
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : isSelected
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-gray-700 hover:border-gray-600 text-white"
                    } ${isRevealed && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="flex items-center">
                      <div className="text-sm">{statement.text}</div>
                    </span>
                    {isRevealed && isSelected && isCorrect && (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
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