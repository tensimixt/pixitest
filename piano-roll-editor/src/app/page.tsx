'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

const PIANO_WIDTH = 100
const WHITE_KEY_HEIGHT = 20
const BLACK_KEY_HEIGHT = 12
const BLACK_KEY_OFFSET = 12
const TOTAL_KEYS = 88 // Standard piano has 88 keys

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || appRef.current) return

    // **Calculate the total height needed for all the keys**
    const totalWhiteKeys = TOTAL_KEYS - Math.floor((TOTAL_KEYS / 12) * 5)
    const totalHeight = totalWhiteKeys * WHITE_KEY_HEIGHT

    // Create the PixiJS Application with the total height
    const pixiApp = new PIXI.Application({
      backgroundColor: 0x2c2c2c,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      width: containerRef.current.clientWidth,
      height: totalHeight, // Set the canvas height to fit all keys
    })

    appRef.current = pixiApp
    containerRef.current.appendChild(pixiApp.view as HTMLCanvasElement)

    // Create containers
    const pianoContainer = new PIXI.Container()
    const gridContainer = new PIXI.Container()
    pixiApp.stage.addChild(pianoContainer)
    pixiApp.stage.addChild(gridContainer)

    // Draw piano keys
    const drawPianoKeys = () => {
      pianoContainer.removeChildren()

      let whiteKeyY = 0

      for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
        const isBlack = isBlackKey(i)
        if (!isBlack) {
          // White key
          const key = new PIXI.Graphics()
          key.beginFill(0xffffff)
          key.lineStyle(1, 0x000000)
          key.drawRect(0, whiteKeyY, PIANO_WIDTH, WHITE_KEY_HEIGHT)
          key.endFill()
          pianoContainer.addChild(key)
          whiteKeyY += WHITE_KEY_HEIGHT
        }
      }

      // Reset Y position for black keys
      whiteKeyY = 0

      for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
        const isBlack = isBlackKey(i)
        if (!isBlack) {
          whiteKeyY += WHITE_KEY_HEIGHT
        } else {
          // Black key
          const key = new PIXI.Graphics()
          key.beginFill(0x000000)
          key.drawRect(
            0,
            whiteKeyY - WHITE_KEY_HEIGHT + BLACK_KEY_OFFSET,
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
      gridContainer.removeChildren()

      const grid = new PIXI.Graphics()
      grid.lineStyle(1, 0x3f3f3f)
      
      // Vertical lines
      for (let x = PIANO_WIDTH; x < pixiApp.screen.width; x += 50) {
        grid.moveTo(x, 0)
        grid.lineTo(x, pixiApp.screen.height)
      }

      // Horizontal lines
      let whiteKeyY = 0
      for (let i = 0; i < TOTAL_KEYS; i++) {
        if (!isBlackKey(i)) {
          grid.moveTo(PIANO_WIDTH, whiteKeyY)
          grid.lineTo(pixiApp.screen.width, whiteKeyY)
          whiteKeyY += WHITE_KEY_HEIGHT
        }
      }

      gridContainer.addChild(grid)
    }

    // Helper function to determine if a key is black
    const isBlackKey = (keyNumber: number): boolean => {
      const octavePosition = keyNumber % 12
      return [1, 3, 6, 8, 10].includes(octavePosition)
    }

    // Initial draw
    drawPianoKeys()
    drawGrid()

    // Cleanup
    return () => {
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
        ref={containerRef}
        className="w-full h-[600px] bg-gray-800 rounded-lg overflow-y-auto"
      />
    </main>
  )
}