'use client'

import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'

const PIANO_WIDTH = 100 // Width of piano keys
const WHITE_KEY_HEIGHT = 20 // Height of white keys
const BLACK_KEY_HEIGHT = 12 // Height of black keys
const BLACK_KEY_OFFSET = 12 // How far black keys stick out

// Define piano key patterns (true = has black key after)
const PIANO_PATTERN = [true, true, false, true, true, true, false] 

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [app, setApp] = useState<PIXI.Application | null>(null)

  useEffect(() => {
    if (!canvasRef.current || app) return

    // Initialize PIXI Application
    const pixiApp = new PIXI.Application({
      resizeTo: canvasRef.current,
      backgroundColor: 0x2c2c2c,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    canvasRef.current.appendChild(pixiApp.view as HTMLCanvasElement)
    setApp(pixiApp)

    // Create containers
    const pianoContainer = new PIXI.Container()
    const gridContainer = new PIXI.Container()
    pixiApp.stage.addChild(pianoContainer)
    pixiApp.stage.addChild(gridContainer)

    // Draw piano keys
    const drawPianoKeys = () => {
      // Draw white keys first
      for (let octave = 0; octave < 8; octave++) {
        for (let i = 0; i < 7; i++) {
          const key = new PIXI.Graphics()
          key.beginFill(0xFFFFFF)
          key.lineStyle(1, 0x000000)
          key.drawRect(
            0,
            (octave * 7 + i) * WHITE_KEY_HEIGHT,
            PIANO_WIDTH,
            WHITE_KEY_HEIGHT
          )
          key.endFill()
          pianoContainer.addChild(key)
        }
      }

      // Draw black keys on top
      for (let octave = 0; octave < 8; octave++) {
        for (let i = 0; i < 7; i++) {
          if (PIANO_PATTERN[i]) {
            const key = new PIXI.Graphics()
            key.beginFill(0x000000)
            key.drawRect(
              0,
              (octave * 7 + i) * WHITE_KEY_HEIGHT + BLACK_KEY_OFFSET,
              PIANO_WIDTH - BLACK_KEY_OFFSET,
              BLACK_KEY_HEIGHT
            )
            key.endFill()
            pianoContainer.addChild(key)
          }
        }
      }
    }

    // Draw grid
    const drawGrid = () => {
      const grid = new PIXI.Graphics()
      grid.lineStyle(1, 0x3f3f3f)
      
      // Vertical lines
      for (let x = PIANO_WIDTH; x < pixiApp.screen.width; x += 100) {
        grid.moveTo(x, 0)
        grid.lineTo(x, pixiApp.screen.height)
      }

      // Horizontal lines
      for (let y = 0; y < pixiApp.screen.height; y += WHITE_KEY_HEIGHT) {
        grid.moveTo(PIANO_WIDTH, y)
        grid.lineTo(pixiApp.screen.width, y)
      }

      gridContainer.addChild(grid)
    }

    drawPianoKeys()
    drawGrid()

    // Cleanup on unmount
    return () => {
      pixiApp.destroy(true)
    }
  }, [app])

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