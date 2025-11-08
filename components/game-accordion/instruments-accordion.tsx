"use client"

import { useState, useRef, useEffect } from "react"
import GameAccordion from "@/components/game-accordion/game-accordion"

interface InstrumentsAccordionProps {
  onComplete: (results: string[]) => void
  completed: boolean
}

const instruments = [
  { id: 0, name: "Bamboo Flute", isDrumTao: false, sound: "🎵" },
  { id: 1, name: "Electric Guitar", isDrumTao: false, sound: "🎸" },
  { id: 2, name: "Keyboard", isDrumTao: false, sound: "🎹" },
  { id: 3, name: "Trumpet", isDrumTao: false, sound: "🎺" },
  { id: 4, name: "Acoustic Guitar", isDrumTao: false, sound: "🎸" },
  { id: 5, name: "Trumpet", isDrumTao: false, sound: "🎺" },
  { id: 6, name: "Keyboard", isDrumTao: false, sound: "🎹" },
  { id: 7, name: "Violin", isDrumTao: false, sound: "🎻" },
  { id: 8, name: "Drum Kit", isDrumTao: true, sound: "🥁" },
  { id: 9, name: "Taiko Drum", isDrumTao: true, sound: "🥁" },
  { id: 10, name: "Accordion", isDrumTao: false, sound: "🎵" },
  { id: 11, name: "Djembe", isDrumTao: false, sound: "🥁" },
  { id: 12, name: "Timpani", isDrumTao: false, sound: "🥁" },
  { id: 13, name: "Banjo", isDrumTao: false, sound: "🎵" },
  { id: 14, name: "Violin", isDrumTao: false, sound: "🎻" },
  { id: 15, name: "Flute", isDrumTao: false, sound: "🎵" },
]

export default function InstrumentsAccordion({ onComplete, completed }: InstrumentsAccordionProps) {
  const [selectedInstruments, setSelectedInstruments] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState(false)
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({})

  useEffect(() => {
    if (selectedInstruments.size === 2 && !revealed) {
      setRevealed(true)
      const selected = Array.from(selectedInstruments)
      setTimeout(() => {
        onComplete(selected.map(String))
      }, 1500)
    }
  }, [selectedInstruments, revealed, onComplete])

  const playSound = (id: number) => {
    if (audioRefs.current[id]) {
      audioRefs.current[id]?.play().catch(() => {})
    }
  }

  const toggleInstrument = (id: number) => {
    if (selectedInstruments.size < 2 && !selectedInstruments.has(id)) {
      setSelectedInstruments(new Set([...selectedInstruments, id]))
    }
  }

  return (
    <GameAccordion title="Guess 2 Drum Tao Instruments" completed={completed}>
      <div>
        <p className="text-gray-300 mb-6 text-center">
          Click on instruments to hear their sound. Find the 2 Drum Tao instruments!
        </p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {instruments.map((instrument) => {
            const isSelected = selectedInstruments.has(instrument.id)
            const isDrumTao = instrument.isDrumTao

            return (
              <div key={instrument.id}>
                <audio
                  ref={(el) => {
                    if (el) audioRefs.current[instrument.id] = el
                  }}
                  src={`data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==`}
                />
                <button
                  onClick={() => {
                    if (!revealed) {
                      playSound(instrument.id)
                      toggleInstrument(instrument.id)
                    }
                  }}
                  className={`w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all text-xs font-semibold ${
                    isSelected && revealed && isDrumTao
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : isSelected && revealed && !isDrumTao
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : isSelected
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-gray-700 hover:border-gray-600 text-gray-300"
                  } ${revealed ? "cursor-default" : "cursor-pointer hover:bg-gray-800/50"}`}
                  disabled={revealed}
                >
                  <span className="text-2xl">{instrument.sound}</span>
                  <span className="line-clamp-2 text-center">{revealed ? instrument.name : "?"}</span>
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Selected: {selectedInstruments.size}/2</span>
          {revealed && (
            <span
              className={`text-sm font-semibold ${
                Array.from(selectedInstruments).every((id) => instruments[id].isDrumTao)
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {Array.from(selectedInstruments).every((id) => instruments[id].isDrumTao) ? "✓ Correct!" : "✗ Try again"}
            </span>
          )}
        </div>

        {revealed && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400 font-semibold text-center">
              {Array.from(selectedInstruments).every((id) => instruments[id].isDrumTao)
                ? "✓ Excellent! You found both Drum Tao instruments!"
                : "✗ Those weren't the right instruments."}
            </p>
          </div>
        )}
      </div>
    </GameAccordion>
  )
}
