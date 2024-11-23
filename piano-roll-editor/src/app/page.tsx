'use client'

import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !canvasRef.current) return

    // Only initialize PIXI after component is mounted
    let app: PIXI.Application | null = null
    
    try {
      app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x2c2c2c,
        antialias: true,
      })

      canvasRef.current.appendChild(app.view as HTMLCanvasElement)

      const notesContainer = new PIXI.Container()
      app.stage.addChild(notesContainer)

      // Rest of your PIXI initialization code...
    } catch (error) {
      console.error('PIXI initialization error:', error)
    }

    // Cleanup
    return () => {
      if (app) {
        app.destroy(true)
      }
    }
  }, [isMounted]) // Add isMounted as dependency

  if (!isMounted) {
    return null // or a loading state
  }

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