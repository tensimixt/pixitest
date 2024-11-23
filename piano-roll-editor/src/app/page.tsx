'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize PIXI Application
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x2c2c2c,
      antialias: true,
    })

    // Add the canvas to our container
    canvasRef.current.appendChild(app.view as HTMLCanvasElement)

    // Create container for notes
    const notesContainer = new PIXI.Container()
    app.stage.addChild(notesContainer)

    // Constants
    const PIXELS_PER_QUARTER = 100
    const NOTE_HEIGHT = 20

    // Example note rendering
    const renderNote = (position: number, duration: number, tone: number) => {
      const note = new PIXI.Graphics()
      note.beginFill(0x4A90E2)
      note.drawRoundedRect(
        position * (PIXELS_PER_QUARTER / 480),
        (127 - tone) * NOTE_HEIGHT,
        duration * (PIXELS_PER_QUARTER / 480),
        NOTE_HEIGHT,
        4
      )
      note.endFill()
      notesContainer.addChild(note)
    }

    // Example: Render some test notes
    renderNote(0, 480, 60)    // Middle C, quarter note
    renderNote(480, 960, 64)  // E4, half note
    renderNote(1440, 480, 67) // G4, quarter note

    // Cleanup on unmount
    return () => {
      app.destroy(true)
    }
  }, [])

  return (
    <main className="min-h-screen p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Piano Roll Editor</h1>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600">
            Load USTX
          </button>
          <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
            Play
          </button>
        </div>
      </div>
      <div 
        ref={canvasRef} 
        className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden"
      />
    </main>
  )
}