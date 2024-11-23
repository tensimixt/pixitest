'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

const PIANO_WIDTH = 100
const WHITE_KEY_HEIGHT = 20
const BLACK_KEY_HEIGHT = 12
const BLACK_KEY_OFFSET = 12
const PIANO_PATTERN = [true, true, false, true, true, true, false]

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null) // Use ref instead of state for the PIXI app

  useEffect(() => {
    // Make sure we're in the browser and the ref is available
    if (typeof window === 'undefined' || !canvasRef.current) return

    try {
      const pixiApp = new PIXI.Application({
        width: canvasRef.current?.clientWidth || 800,
        height: canvasRef.current?.clientHeight || 600,
        backgroundColor: 0x2c2c2c,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      })

      // Store the app reference
      appRef.current = pixiApp

      // Make sure the canvas ref still exists
      if (canvasRef.current) {
        canvasRef.current.appendChild(pixiApp.view as HTMLCanvasElement)

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
      }
    } catch (error) {
      console.error('Error initializing PIXI:', error)
    }

    // Cleanup function
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, []) // Remove app from dependencies

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