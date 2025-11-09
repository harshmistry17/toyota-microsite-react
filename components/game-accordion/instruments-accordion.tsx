// "use client"

// import { useState, useRef, useEffect } from "react"
// import GameAccordion from "@/components/game-accordion/game-accordion"

// interface InstrumentsAccordionProps {
//   onComplete: (results: string[]) => void
//   completed: boolean
// }

// const instruments = [
//   { id: 0, name: "Bamboo Flute", isDrumTao: false, sound: "🎵" },
//   { id: 1, name: "Electric Guitar", isDrumTao: false, sound: "🎸" },
//   { id: 2, name: "Keyboard", isDrumTao: false, sound: "🎹" },
//   { id: 3, name: "Trumpet", isDrumTao: false, sound: "🎺" },
//   { id: 4, name: "Acoustic Guitar", isDrumTao: false, sound: "🎸" },
//   { id: 5, name: "Trumpet", isDrumTao: false, sound: "🎺" },
//   { id: 6, name: "Keyboard", isDrumTao: false, sound: "🎹" },
//   { id: 7, name: "Violin", isDrumTao: false, sound: "🎻" },
//   { id: 8, name: "Drum Kit", isDrumTao: true, sound: "🥁" },
//   { id: 9, name: "Taiko Drum", isDrumTao: true, sound: "🥁" },
//   { id: 10, name: "Accordion", isDrumTao: false, sound: "🎵" },
//   { id: 11, name: "Djembe", isDrumTao: false, sound: "🥁" },
//   { id: 12, name: "Timpani", isDrumTao: false, sound: "🥁" },
//   { id: 13, name: "Banjo", isDrumTao: false, sound: "🎵" },
//   { id: 14, name: "Violin", isDrumTao: false, sound: "🎻" },
//   { id: 15, name: "Flute", isDrumTao: false, sound: "🎵" },
// ]

// export default function InstrumentsAccordion({ onComplete, completed }: InstrumentsAccordionProps) {
//   const [selectedInstruments, setSelectedInstruments] = useState<Set<number>>(new Set())
//   const [revealed, setRevealed] = useState(false)
//   const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({})

//   useEffect(() => {
//     if (selectedInstruments.size === 2 && !revealed) {
//       setRevealed(true)
//       const selected = Array.from(selectedInstruments)
//       setTimeout(() => {
//         onComplete(selected.map(String))
//       }, 1500)
//     }
//   }, [selectedInstruments, revealed, onComplete])

//   const playSound = (id: number) => {
//     if (audioRefs.current[id]) {
//       audioRefs.current[id]?.play().catch(() => {})
//     }
//   }

//   const toggleInstrument = (id: number) => {
//     if (selectedInstruments.size < 2 && !selectedInstruments.has(id)) {
//       setSelectedInstruments(new Set([...selectedInstruments, id]))
//     }
//   }

//   return (
//     <GameAccordion title="Guess 2 Drum Tao Instruments" completed={completed}>
//       <div>
//         <p className="text-gray-300 mb-6 text-center">
//           Click on instruments to hear their sound. Find the 2 Drum Tao instruments!
//         </p>

//         <div className="grid grid-cols-4 gap-2 mb-6">
//           {instruments.map((instrument) => {
//             const isSelected = selectedInstruments.has(instrument.id)
//             const isDrumTao = instrument.isDrumTao

//             return (
//               <div key={instrument.id}>
//                 <audio
//                   ref={(el) => {
//                     if (el) audioRefs.current[instrument.id] = el
//                   }}
//                   src={`data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==`}
//                 />
//                 <button
//                   onClick={() => {
//                     if (!revealed) {
//                       playSound(instrument.id)
//                       toggleInstrument(instrument.id)
//                     }
//                   }}
//                   className={`w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all text-xs font-semibold ${
//                     isSelected && revealed && isDrumTao
//                       ? "border-green-500 bg-green-500/20 text-green-400"
//                       : isSelected && revealed && !isDrumTao
//                         ? "border-red-500 bg-red-500/20 text-red-400"
//                         : isSelected
//                           ? "border-blue-500 bg-blue-500/10 text-blue-400"
//                           : "border-gray-700 hover:border-gray-600 text-gray-300"
//                   } ${revealed ? "cursor-default" : "cursor-pointer hover:bg-gray-800/50"}`}
//                   disabled={revealed}
//                 >
//                   <span className="text-2xl">{instrument.sound}</span>
//                   <span className="line-clamp-2 text-center">{revealed ? instrument.name : "?"}</span>
//                 </button>
//               </div>
//             )
//           })}
//         </div>

//         <div className="flex items-center justify-between">
//           <span className="text-sm text-gray-400">Selected: {selectedInstruments.size}/2</span>
//           {revealed && (
//             <span
//               className={`text-sm font-semibold ${
//                 Array.from(selectedInstruments).every((id) => instruments[id].isDrumTao)
//                   ? "text-green-400"
//                   : "text-red-400"
//               }`}
//             >
//               {Array.from(selectedInstruments).every((id) => instruments[id].isDrumTao) ? "✓ Correct!" : "✗ Try again"}
//             </span>
//           )}
//         </div>

//         {revealed && (
//           <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
//             <p className="text-green-400 font-semibold text-center">
//               {Array.from(selectedInstruments).every((id) => instruments[id].isDrumTao)
//                 ? "✓ Excellent! You found both Drum Tao instruments!"
//                 : "✗ Those weren't the right instruments."}
//             </p>
//           </div>
//         )}
//       </div>
//     </GameAccordion>
//   )
// }
"use client"

import { useState, useRef } from "react"
import GameAccordion from "@/components/game-accordion/game-accordion"
import Image from "next/image"

interface InstrumentsAccordionProps {
  onComplete: (results: string[]) => void
  completed: boolean
  disabled?: boolean
}

// Configuration: IDs of the correct Drum Tao instruments
const CORRECT_INSTRUMENTS = [1, 4, 13, 16] // Change these IDs to match your correct instruments

// Total number of instrument tiles
const TOTAL_INSTRUMENTS = 16

export default function InstrumentsAccordion({ onComplete, completed, disabled = false }: InstrumentsAccordionProps) {
  const [selectedInstruments, setSelectedInstruments] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({})

  const playSound = (id: number) => {
    // Stop all other sounds
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    // Play the selected sound
    if (audioRefs.current[id]) {
      audioRefs.current[id]?.play().catch(() => {})
    }
  }

  const toggleInstrument = (id: number) => {
    if (revealed) return // Don't allow selection after reveal

    setSelectedInstruments((prev) => {
      if (prev.includes(id)) {
        // Deselect if already selected - don't play sound
        return prev.filter((instId) => instId !== id)
      } else {
        // Play sound only when selecting (not deselecting)
        playSound(id)
        
        if (prev.length < 2) {
          // Add if less than 2 selected
          return [...prev, id]
        } else {
          // Replace the first selected item (FIFO - remove oldest)
          return [prev[1], id]
        }
      }
    })
  }

  const handleSubmit = () => {
    if (selectedInstruments.length === 2 && !revealed) {
      // Stop all sounds when submitting
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.currentTime = 0
        }
      })

      setRevealed(true)
      setTimeout(() => {
        onComplete(selectedInstruments.map(String))
      }, 1500)
    }
  }

  const isCorrect =
    revealed &&
    selectedInstruments.length === 2 &&
    selectedInstruments.every((id) => CORRECT_INSTRUMENTS.includes(id))

  return (
    <GameAccordion
      title="Guess 2 Drum Tao Instruments"
      completed={completed}
      defaultExpanded={!disabled}
      disabled={disabled}
    >
      <div>
        <p className="text-gray-300 mb-6 text-center">
          Pick any 2 instruments
        </p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {Array.from({ length: TOTAL_INSTRUMENTS }, (_, index) => {
            const id = index + 1
            const isSelected = selectedInstruments.includes(id)
            const isDrumTao = CORRECT_INSTRUMENTS.includes(id)
            const selectionOrder = selectedInstruments.indexOf(id) + 1

            return (
              <div key={id} className="relative">
                <audio
                  ref={(el) => {
                    if (el) audioRefs.current[id] = el
                  }}
                  src={`/instruments/sound/${id}.mp3`}
                  preload="auto"
                />
                <button
                  onClick={() => toggleInstrument(id)}
                  className={`w-full aspect-square border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                    isSelected && revealed && isDrumTao
                      ? "border-green-500 bg-green-500/20"
                      : isSelected && revealed && !isDrumTao
                        ? "border-red-500 bg-red-500/20"
                        : isSelected
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-gray-700 hover:border-gray-600"
                  } ${revealed ? "cursor-default" : "cursor-pointer hover:bg-gray-800/30"}`}
                  disabled={revealed}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={`/instruments/images/${id}.png`}
                      alt={`Instrument ${id}`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        {!revealed && (
          <button
            onClick={handleSubmit}
            disabled={selectedInstruments.length !== 2}
            className={`w-full py-3 px-6 font-bold text-lg transition-all ${
              selectedInstruments.length === 2
                ? "bg-[#FF0000] hover:bg-[#27c277]/90 text-white cursor-pointer"
                : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
            }`}
          >
            Submit Answer
          </button>
        )}

      </div>
    </GameAccordion>
  )
}