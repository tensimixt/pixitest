
'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

const PIANO_WIDTH = 100
const WHITE_KEY_HEIGHT = 20
const BLACK_KEY_HEIGHT = 12
const BLACK_KEY_OFFSET = 12

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current || appRef.current) return

    // Initialize containers outside of setupPixi so they are accessible
    const pianoContainer = new PIXI.Container()
    const gridContainer = new PIXI.Container()

    // Draw piano keys
    const drawPianoKeys = () => {
      if (!appRef.current) return
      pianoContainer.removeChildren()

      const numWhiteKeys = Math.ceil(appRef.current.screen.height / WHITE_KEY_HEIGHT)
      const numOctaves = Math.ceil(numWhiteKeys / 7)

      // White keys
      for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < 7; i++) {
          const keyYPos = (octave * 7 + i) * WHITE_KEY_HEIGHT
          if (keyYPos >= appRef.current.screen.height) break // Stop if exceeding screen height

          const key = new PIXI.Graphics()
          // Set fill style and draw rectangle
          key.beginFill(0xffffff)
          key.lineStyle(1, 0x000000)
          key.drawRect(
            0,
            keyYPos,
            PIANO_WIDTH,
            WHITE_KEY_HEIGHT
          )
          key.endFill()

          pianoContainer.addChild(key)
        }
      }

      // Black keys
      const blackKeysInOctave = [0, 1, 3, 4, 5] // Positions of black keys relative to white keys in an octave
      for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < blackKeysInOctave.length; i++) {
          const keyIndex = blackKeysInOctave[i]
          const keyYPos = (octave * 7 + keyIndex) * WHITE_KEY_HEIGHT + BLACK_KEY_OFFSET

          if (keyYPos >= appRef.current.screen.height) break // Stop if exceeding screen height

          const key = new PIXI.Graphics()
          // Set fill style and draw rectangle
          key.beginFill(0x000000)
          key.drawRect(
            0,
            keyYPos,
            PIANO_WIDTH - BLACK_KEY_OFFSET,
            BLACK_KEY_HEIGHT
          )
          key.endFill()

          pianoContainer.addChild(key)
        }
      }
    }

    // Draw grid
    const drawGrid = () => {
      if (!appRef.current) return
      gridContainer.removeChildren()

      const grid = new PIXI.Graphics()
      grid.lineStyle(1, 0x3f3f3f)
      
      // Vertical lines
      for (let x = PIANO_WIDTH; x < appRef.current.screen.width; x += 50) {
        grid.moveTo(x, 0)
        grid.lineTo(x, appRef.current.screen.height)
      }

      // Horizontal lines
      for (let y = 0; y < appRef.current.screen.height; y += WHITE_KEY_HEIGHT) {
        grid.moveTo(PIANO_WIDTH, y)
        grid.lineTo(appRef.current.screen.width, y)
      }

      gridContainer.addChild(grid)
    }

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !appRef.current) return

      // Update the resizeTo property
      appRef.current.resizeTo = canvasRef.current
      
      // Resize the renderer
      appRef.current.renderer.resize(
        canvasRef.current.clientWidth,
        canvasRef.current.clientHeight
      )

      // Redraw grid and piano keys when resizing
      drawGrid()
      drawPianoKeys()
    }

    const setupPixi = async () => {
      // Create the PixiJS Application
      const pixiApp = new PIXI.Application()
      await pixiApp.init({
        background: '#2c2c2c',
        resizeTo: canvasRef.current!, // Assert non-null
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      })

      appRef.current = pixiApp
      canvasRef.current!.appendChild(pixiApp.canvas as HTMLCanvasElement)

      // Add containers to the stage
      pixiApp.stage.addChild(pianoContainer)
      pixiApp.stage.addChild(gridContainer)

      // Initial draw
      drawPianoKeys()
      drawGrid()
    }

    setupPixi()

    window.addEventListener('resize', handleResize)
    
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