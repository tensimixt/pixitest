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
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current || appRef.current) return

    const pixiApp = new PIXI.Application({
      background: '#2c2c2c',
      resizeTo: canvasRef.current,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    appRef.current = pixiApp
    canvasRef.current.appendChild(pixiApp.view as HTMLCanvasElement)

    // Create containers
    const pianoContainer = new PIXI.Container()
    const gridContainer = new PIXI.Container()
    pixiApp.stage.addChild(pianoContainer)
    pixiApp.stage.addChild(gridContainer)

    // Draw piano keys
    const drawPianoKeys = () => {
      // White keys
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

      // Black keys
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
      for (let x = PIANO_WIDTH; x < pixiApp.screen.width; x += 50) {
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

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && appRef.current) {
        appRef.current.renderer.resize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        )
        // Redraw grid when resizing
        gridContainer.removeChildren()
        drawGrid()
      }
    }

    window.addEventListener('resize', handleResize)
    
    // Initial draw
    drawPianoKeys()
    drawGrid()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [])

  return (
    <main className="min-h-screen p-4 bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Piano Roll Editor</h1>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Load USTX
          </button>
          <button className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
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