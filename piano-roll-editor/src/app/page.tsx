
'use client'

import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import yaml from 'js-yaml'
import { UstxData, Note } from '../types/ustx'

const PIANO_WIDTH = 130 // Width of the piano container
const KEY_WIDTH = 110   // Width of the keys
const KEY_X_OFFSET = (PIANO_WIDTH - KEY_WIDTH) / 2 // Offset to center the keys
const KEY_HEIGHT = 12 // Reduced key height to fit more notes vertically
const TOTAL_KEYS = 128 // From MIDI note 0 to 127

const totalHeight = TOTAL_KEYS * KEY_HEIGHT

export default function Home() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const pianoAppRef = useRef<PIXI.Application | null>(null)
  const gridAppRef = useRef<PIXI.Application | null>(null)

  const [ustxData, setUstxData] = useState<UstxData | null>(null)
  const [notes, setNotes] = useState<Note[]>([])

  // Helper functions
  // -----------------------------------------------

  // Helper function to determine if a key is black
  const isBlackKey = (keyNumber: number): boolean => {
    const noteIndex = keyNumber % 12
    return [1, 3, 6, 8, 10].includes(noteIndex)
  }

  // Helper function to get the key name
  const getKeyName = (keyNumber: number): string => {
    const octave = Math.floor(keyNumber / 12) - 1 // Adjusted octave calculation
    const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
    const noteIndex = keyNumber % 12
    return `${noteNames[noteIndex]}${octave}`
  }

  // Function to get total duration in ticks
  const getTotalDurationInTicks = (notes: Note[]): number => {
    let maxTick = 0
    notes.forEach(note => {
      const noteEnd = note.position + note.duration
      if (noteEnd > maxTick) {
        maxTick = noteEnd
      }
    })
    return maxTick
  }

  // Draw piano keys in pianoApp
  const drawPianoKeys = () => {
    if (!pianoAppRef.current) return
    const pianoApp = pianoAppRef.current
    const pianoStage = pianoApp.stage
    pianoStage.removeChildren()

    let keyY = 0

    for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
      const black = isBlackKey(i)
      const keyName = getKeyName(i)

      const key = new PIXI.Graphics()
      key.beginFill(black ? 0x2c2c2c : 0xffffff)
      key.lineStyle(1, 0x000000)
      key.drawRect(KEY_X_OFFSET, keyY, KEY_WIDTH, KEY_HEIGHT)
      key.endFill()

      // Create text for the key name
      const keyText = new PIXI.Text(keyName, {
        fontFamily: 'Arial',
        fontSize: 7, // Adjusted font size for smaller keys
        fill: black ? 0xffffff : 0x000000, // White text on black keys, black text on white keys
        align: 'left',
      })
      // Align the text to the left
      keyText.anchor.set(0, 0.5) // Left-aligned, center vertically
      keyText.x = KEY_X_OFFSET + 5 // Move text 5 pixels from the left edge of the key
      keyText.y = keyY + KEY_HEIGHT / 2

      // Add key and text to the stage
      pianoStage.addChild(key)
      pianoStage.addChild(keyText)

      keyY += KEY_HEIGHT
    }
  }

  // Draw grid in gridApp
  const drawGrid = (gridWidth: number) => {
    if (!gridAppRef.current) return
    const gridApp = gridAppRef.current
    const gridStage = gridApp.stage
    gridStage.removeChildren()

    const grid = new PIXI.Graphics()
    grid.lineStyle(1, 0x3f3f3f)

    // Horizontal lines for each key
    let keyY = 0
    for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
      grid.moveTo(0, keyY)
      grid.lineTo(gridWidth, keyY)
      keyY += KEY_HEIGHT
    }

    // Vertical lines
    for (let x = 0; x < gridWidth; x += 50) {
      grid.moveTo(x, 0)
      grid.lineTo(x, gridApp.screen.height)
    }

    // Background shading for black keys
    keyY = 0
    for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
      if (isBlackKey(i)) {
        grid.beginFill(0x262626)
        grid.drawRect(0, keyY, gridWidth, KEY_HEIGHT)
        grid.endFill()
      }
      keyY += KEY_HEIGHT
    }

    gridStage.addChild(grid)
  }

  // Draw notes
  const drawNotes = (notes: Note[]) => {
    if (!ustxData || !gridAppRef.current) return
    const gridApp = gridAppRef.current
    const gridStage = gridApp.stage

    // Remove existing notes
    const existingNotes = gridStage.getChildByName('notesContainer')
    if (existingNotes) {
      gridStage.removeChild(existingNotes)
    }

    const notesContainer = new PIXI.Container()
    notesContainer.name = 'notesContainer'

    const TICKS_PER_BEAT = ustxData.resolution || 480
    const GRID_UNIT_WIDTH = 50 // Width of one beat in pixels
    const NOTE_HEIGHT = KEY_HEIGHT // Height of one semitone, matching the key height

    notes.forEach((note) => {
      const { position, duration, tone, lyric } = note

      // Calculate the x position (time axis)
      const startBeat = position / TICKS_PER_BEAT
      const x = startBeat * GRID_UNIT_WIDTH

      const noteNumber = tone
      const keyIndex = TOTAL_KEYS - noteNumber - 1 // Reverse the key index to match the piano orientation

      // Calculate the y position (pitch axis)
      const y = keyIndex * NOTE_HEIGHT

      // Calculate the width (duration)
      const durationBeats = duration / TICKS_PER_BEAT
      const width = durationBeats * GRID_UNIT_WIDTH

      // Draw the note rectangle
      const noteGraphics = new PIXI.Graphics()
      noteGraphics.beginFill(0xffd700)
      noteGraphics.lineStyle(1, 0x000000)
      noteGraphics.drawRect(x, y, width, NOTE_HEIGHT)
      noteGraphics.endFill()

      // Add the lyric text
      const lyricText = new PIXI.Text(lyric, {
        fontFamily: 'Arial',
        fontSize: 8, // Adjusted font size for smaller notes
        fill: 0x000000,
        align: 'center',
      })
      lyricText.anchor.set(0.5, 0.5)
      lyricText.x = x + width / 2
      lyricText.y = y + NOTE_HEIGHT / 2

      notesContainer.addChild(noteGraphics)
      notesContainer.addChild(lyricText)
    })

    gridStage.addChild(notesContainer)
  }

  // ------------------------------------------------------

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !pianoContainerRef.current ||
      !gridContainerRef.current ||
      pianoAppRef.current ||
      gridAppRef.current
    )
      return

    // Create the PIXI Application for the piano keys
    const pianoApp = new PIXI.Application({
      backgroundColor: 0x2c2c2c,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      width: PIANO_WIDTH, // Width of the piano container
      height: totalHeight,
    })

    pianoAppRef.current = pianoApp

    // Center the canvas inside the piano container
    const pianoCanvas = pianoApp.view as HTMLCanvasElement
    pianoCanvas.style.display = 'block'
    pianoCanvas.style.margin = '0 auto'
    // Set canvas style to prevent scaling
    pianoCanvas.style.width = `${pianoApp.renderer.width / pianoApp.renderer.resolution}px`
    pianoCanvas.style.height = `${pianoApp.renderer.height / pianoApp.renderer.resolution}px`

    pianoContainerRef.current.appendChild(pianoCanvas)

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

    // Set canvas style to prevent scaling
    const gridCanvas = gridApp.view as HTMLCanvasElement
    gridCanvas.style.width = `${gridApp.renderer.width / gridApp.renderer.resolution}px`
    gridCanvas.style.height = `${gridApp.renderer.height / gridApp.renderer.resolution}px`

    // Set the scrollHeight explicitly for both containers
    if (pianoContainerRef.current && gridContainerRef.current) {
      const scrollHeight = totalHeight;
      pianoContainerRef.current.style.height = '600px'; // Match the container height
      gridContainerRef.current.style.height = '600px';  // Match the container height
      
      // Create a wrapper div for the grid canvas to ensure proper scrolling
      const gridWrapper = document.createElement('div');
      gridWrapper.style.height = `${scrollHeight}px`;
      gridWrapper.style.position = 'relative';
      gridCanvas.style.position = 'absolute';
      gridCanvas.style.top = '0';
      gridCanvas.style.left = '0';
      
      // Replace the canvas with the wrapper containing the canvas
      gridContainerRef.current.innerHTML = '';
      gridWrapper.appendChild(gridCanvas);
      gridContainerRef.current.appendChild(gridWrapper);
    }

    // Initial draw
    drawPianoKeys()
    drawGrid(gridApp.screen.width)

    if (notes.length > 0) {
      drawNotes(notes)
    }

    // Handle resize event
    // window.addEventListener('resize', handleResize)

    // Synchronize vertical scrolling between piano and grid containers
    const syncScroll = () => {
      if (!pianoContainerRef.current || !gridContainerRef.current) return
      const scrollTop = gridContainerRef.current.scrollTop;
      if (pianoContainerRef.current.scrollTop !== scrollTop) {
        pianoContainerRef.current.scrollTop = scrollTop;
      }
    }

    const syncScrollReverse = () => {
      if (!pianoContainerRef.current || !gridContainerRef.current) return
      const scrollTop = pianoContainerRef.current.scrollTop;
      if (gridContainerRef.current.scrollTop !== scrollTop) {
        gridContainerRef.current.scrollTop = scrollTop;
      }
    }

    gridContainerRef.current.addEventListener('scroll', syncScroll)
    pianoContainerRef.current.addEventListener('scroll', syncScrollReverse)

    // Cleanup
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
  }, []) // Removed ustxData and notes from dependencies

  // Handle resize
  const handleResize = () => {
    if (!gridContainerRef.current || !gridAppRef.current || !ustxData) return
  
    const gridApp = gridAppRef.current
  
    const TICKS_PER_BEAT = ustxData.resolution || 480
    const GRID_UNIT_WIDTH = 50 // Width of one beat in pixels
  
    const totalTicks = getTotalDurationInTicks(notes)
    const totalBeats = totalTicks / TICKS_PER_BEAT
    const gridWidth = totalBeats * GRID_UNIT_WIDTH
  
    const newWidth = Math.max(gridContainerRef.current.clientWidth, gridWidth)
  
    // Resize grid app with consistent height
    gridApp.renderer.resize(newWidth, totalHeight)
  
    // Set canvas style to prevent scaling
    const gridCanvas = gridApp.view as HTMLCanvasElement
    gridCanvas.style.width = `${newWidth / gridApp.renderer.resolution}px`
    gridCanvas.style.height = `${totalHeight / gridApp.renderer.resolution}px`
  
    // Redraw everything in the correct order
    drawGrid(newWidth)
    drawNotes(notes) // Always redraw notes after grid
  }

  // Effect to update grid and notes when ustxData or notes change
  useEffect(() => {
    if (!gridAppRef.current || !gridContainerRef.current || !ustxData) return

    const gridApp = gridAppRef.current

    const TICKS_PER_BEAT = ustxData.resolution || 480
    const GRID_UNIT_WIDTH = 50 // Width of one beat in pixels

    const totalTicks = getTotalDurationInTicks(notes)
    const totalBeats = totalTicks / TICKS_PER_BEAT
    const gridWidth = totalBeats * GRID_UNIT_WIDTH

    const newWidth = Math.max(gridContainerRef.current.clientWidth, gridWidth)

    // Resize grid app with consistent height
    gridApp.renderer.resize(newWidth, totalHeight)

    // Set canvas style to prevent scaling
    const gridCanvas = gridApp.view as HTMLCanvasElement
    gridCanvas.style.width = `${newWidth / gridApp.renderer.resolution}px`
    gridCanvas.style.height = `${totalHeight / gridApp.renderer.resolution}px`

    drawGrid(newWidth)
    if (notes.length > 0) {
      drawNotes(notes)
    }
  }, [ustxData, notes])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const contents = e.target?.result as string
        try {
          const data = yaml.load(contents) as UstxData
          setUstxData(data)
          const extractedNotes = data.voice_parts[0].notes
          setNotes(extractedNotes)
        } catch (error) {
          console.error('Error parsing USTX file:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Piano Roll Editor</h1>
        <div className="space-x-2">
          {/* File upload input */}
          <input
            type="file"
            accept=".ustx,.yaml,.yml"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load USTX
          </label>
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
          style={{
            width: `${PIANO_WIDTH}px`,
            maxHeight: '600px',
            overflowX: 'hidden', // Prevent horizontal scrolling
          }}
        />
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-auto"
          style={{
            height: '600px',
            overflowX: 'auto',
            overflowY: 'auto',
          }}
        />
      </div>
    </main>
  )
}