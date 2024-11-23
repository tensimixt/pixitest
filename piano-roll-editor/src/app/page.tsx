'use client'

import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

const PIANO_WIDTH = 100
const WHITE_KEY_HEIGHT = 20
const BLACK_KEY_HEIGHT = 12
const BLACK_KEY_OFFSET = 12
const TOTAL_KEYS = 88 // Standard piano has 88 keys

export default function Home() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const pianoAppRef = useRef<PIXI.Application | null>(null)
  const gridAppRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !pianoContainerRef.current ||
      !gridContainerRef.current ||
      pianoAppRef.current ||
      gridAppRef.current
    )
      return

    // Calculate the total height needed for all the white keys
    const totalWhiteKeys = TOTAL_KEYS - Math.floor((TOTAL_KEYS / 12) * 5)
    const totalHeight = totalWhiteKeys * WHITE_KEY_HEIGHT

    // Create the PIXI Application for the piano keys
    const pianoApp = new PIXI.Application({
      backgroundColor: 0x2c2c2c,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      width: PIANO_WIDTH,
      height: totalHeight,
    })

    pianoAppRef.current = pianoApp
    pianoContainerRef.current.appendChild(pianoApp.view as HTMLCanvasElement)

    // Create the PIXI Application for the grid
    const gridApp = new PIXI.Application({
      backgroundColor: 0x2c2c2c,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      width: gridContainerRef.current.clientWidth,
      height: totalHeight,
    })

    gridAppRef.current = gridApp
    gridContainerRef.current.appendChild(gridApp.view as HTMLCanvasElement)

    // **Helper function to determine if a key is black**
    const isBlackKey = (keyNumber: number): boolean => {
      const octavePosition = keyNumber % 12
      return [1, 3, 6, 8, 10].includes(octavePosition)
    }

    // **Helper function to get the key name**
    const getKeyName = (keyNumber: number): string => {
      const octave = Math.floor(keyNumber / 12) - 1
      const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
      const noteIndex = keyNumber % 12
      return `${noteNames[noteIndex]}${octave}`
    }

    // **Draw piano keys in pianoApp**
    const drawPianoKeys = () => {
      const pianoStage = pianoApp.stage
      pianoStage.removeChildren()

      let whiteKeyY = 0

      for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
        const isBlack = isBlackKey(i)
        const keyName = getKeyName(i)
        if (!isBlack) {
          // White key
          const key = new PIXI.Graphics()
          key.beginFill(0xffffff)
          key.lineStyle(1, 0x000000)
          key.drawRect(0, whiteKeyY, PIANO_WIDTH, WHITE_KEY_HEIGHT)
          key.endFill()

          // Create text for the key name
          const keyText = new PIXI.Text(keyName, {
            fontFamily: 'Arial',
            fontSize: 8, // Reduced font size
            fill: 0x000000, // Black color for text on white keys
            align: 'center',
          })
          // Center the text on the key
          keyText.anchor.set(0.5)
          keyText.x = PIANO_WIDTH / 2
          keyText.y = whiteKeyY + WHITE_KEY_HEIGHT / 2

          // Add key and text to the stage
          pianoStage.addChild(key)
          pianoStage.addChild(keyText)

          whiteKeyY += WHITE_KEY_HEIGHT
        }
      }

      // Reset Y position for black keys
      whiteKeyY = 0

      for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
        const isBlack = isBlackKey(i)
        const keyName = getKeyName(i)
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

          // Create text for the key name
          const keyText = new PIXI.Text(keyName, {
            fontFamily: 'Arial',
            fontSize: 8, // Reduced font size
            fill: 0xffffff, // White color for text on black keys
            align: 'center',
          })
          // Center the text on the key
          keyText.anchor.set(0.5)
          keyText.x = (PIANO_WIDTH - BLACK_KEY_OFFSET) / 2
          keyText.y = whiteKeyY - WHITE_KEY_HEIGHT + BLACK_KEY_OFFSET + BLACK_KEY_HEIGHT / 2

          // Add key and text to the stage
          pianoStage.addChild(key)
          pianoStage.addChild(keyText)
        }
      }
    }

    // **Draw grid in gridApp**
    const drawGrid = () => {
      const gridStage = gridApp.stage
      gridStage.removeChildren()

      const grid = new PIXI.Graphics()
      grid.lineStyle(1, 0x3f3f3f)

      // Horizontal lines aligned with white keys
      let whiteKeyY = 0
      for (let i = 0; i < TOTAL_KEYS; i++) {
        if (!isBlackKey(i)) {
          grid.moveTo(0, whiteKeyY)
          grid.lineTo(gridApp.screen.width, whiteKeyY)
          whiteKeyY += WHITE_KEY_HEIGHT
        }
      }

      // Vertical lines
      for (let x = 0; x < gridApp.screen.width; x += 50) {
        grid.moveTo(x, 0)
        grid.lineTo(x, gridApp.screen.height)
      }

      gridStage.addChild(grid)
    }

    // **Handle resize**
    const handleResize = () => {
      if (!gridContainerRef.current || !gridAppRef.current) return

      // Resize grid app
      gridApp.renderer.resize(
        gridContainerRef.current.clientWidth,
        totalHeight
      )

      // Redraw grid
      drawGrid()
    }

    // **Initial draw**
    drawPianoKeys()
    drawGrid()

    // **Handle resize event**
    window.addEventListener('resize', handleResize)

    // Synchronize vertical scrolling between piano and grid containers
    const syncScroll = () => {
      if (!pianoContainerRef.current || !gridContainerRef.current) return
      pianoContainerRef.current.scrollTop = gridContainerRef.current.scrollTop
    }

    const syncScrollReverse = () => {
      if (!pianoContainerRef.current || !gridContainerRef.current) return
      gridContainerRef.current.scrollTop = pianoContainerRef.current.scrollTop
    }

    gridContainerRef.current.addEventListener('scroll', syncScroll)
    pianoContainerRef.current.addEventListener('scroll', syncScrollReverse)

    // **Cleanup**
    return () => {
      window.removeEventListener('resize', handleResize)
      gridContainerRef.current?.removeEventListener('scroll', syncScroll)
      pianoContainerRef.current?.removeEventListener('scroll', syncScrollReverse)
      if (pianoAppRef.current) {
        pianoAppRef.current.destroy(true)
        pianoAppRef.current = null
      }
      if (gridAppRef.current) {
        gridAppRef.current.destroy(true)
        gridAppRef.current = null
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
        className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden flex"
      >
        <div
          ref={pianoContainerRef}
          className="overflow-y-auto"
          style={{ width: `${PIANO_WIDTH}px`, maxHeight: '600px' }}
        />
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-auto"
          style={{ maxHeight: '600px' }}
        />
      </div>
    </main>
  )
}