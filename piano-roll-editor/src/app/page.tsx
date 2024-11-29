'use client'

import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import yaml from 'js-yaml'
import debounce from 'lodash.debounce'

// Define interfaces for USTX data structure
interface UstxData {
  name: string
  resolution: number
  bpm: number
  beat_per_bar: number
  beat_unit: number
  voice_parts: VoicePart[]
}

interface VoicePart {
  name: string
  track_no: number
  position: number
  notes: Note[]
}

interface Note {
  position: number
  duration: number
  tone: number
  lyric: string
  pitch?: {
    data: PitchPoint[]
    snap_first: boolean
  }
  vibrato?: {
    length: number
    period: number
    depth: number
    in: number
    out: number
    shift: number
    drift: number
  }
}

interface PitchPoint {
  x: number
  y: number
  shape: string
}

const PIANO_WIDTH = 130
const KEY_WIDTH = 110
const KEY_X_OFFSET = (PIANO_WIDTH - KEY_WIDTH) / 2
const KEY_HEIGHT = 12
const TOTAL_KEYS = 128

const totalHeight = TOTAL_KEYS * KEY_HEIGHT

export default function Home() {
  const pianoContainerRef = useRef<HTMLDivElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const pianoAppRef = useRef<PIXI.Application | null>(null)
  const gridAppRef = useRef<PIXI.Application | null>(null)

  const [ustxData, setUstxData] = useState<UstxData | null>(null)
  const [currentBPM, setCurrentBPM] = useState<number>(120)
  const [resolution, setResolution] = useState<number>(480)

  const isBlackKey = (keyNumber: number): boolean => {
    const noteIndex = keyNumber % 12
    return [1, 3, 6, 8, 10].includes(noteIndex)
  }

  const getKeyName = (keyNumber: number): string => {
    const octave = Math.floor(keyNumber / 12) - 1
    const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
    const noteIndex = keyNumber % 12
    return `${noteNames[noteIndex]}${octave}`
  }

  const ticksToPixels = (ticks: number): number => {
    const PIXELS_PER_BEAT = 50
    return (ticks / resolution) * PIXELS_PER_BEAT
  }

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
      key.lineStyle(1, 0x000000)
      key.beginFill(black ? 0x2c2c2c : 0xffffff)
      key.drawRect(KEY_X_OFFSET, keyY, KEY_WIDTH, KEY_HEIGHT)
      key.endFill()

      const keyText = new PIXI.Text(keyName, {
        fontFamily: 'Arial',
        fontSize: 7,
        fill: black ? 0xffffff : 0x000000,
        align: 'left',
      })
      keyText.anchor.set(0, 0.5)
      keyText.x = KEY_X_OFFSET + 5
      keyText.y = keyY + KEY_HEIGHT / 2

      pianoStage.addChild(key)
      pianoStage.addChild(keyText)

      keyY += KEY_HEIGHT
    }
  }

  const drawGrid = (width: number) => {
    if (!gridAppRef.current) return
    const gridApp = gridAppRef.current
    const gridStage = gridApp.stage
    gridStage.removeChildren()

    const grid = new PIXI.Graphics()

    // Draw background shading for black keys
    let keyY = 0
    for (let i = TOTAL_KEYS - 1; i >= 0; i--) {
      if (isBlackKey(i)) {
        grid.beginFill(0x262626, 0.5)
        grid.drawRect(0, keyY, width, KEY_HEIGHT)
        grid.endFill()
      }
      keyY += KEY_HEIGHT
    }

    // Draw horizontal lines
    grid.lineStyle(1, 0x3f3f3f, 0.5)
    for (let i = 0; i <= TOTAL_KEYS; i++) {
      const y = i * KEY_HEIGHT
      grid.moveTo(0, y)
      grid.lineTo(width, y)
    }

    // Draw vertical lines
    const beatWidth = 50
    for (let x = 0; x <= width; x += beatWidth) {
      grid.moveTo(x, 0)
      grid.lineTo(x, totalHeight)
    }

    gridStage.addChild(grid)
  }

  const drawNotes = (notes: Note[]) => {
    if (!gridAppRef.current) return
    const gridApp = gridAppRef.current
    const gridStage = gridApp.stage

    // Remove existing notes
    const existingNotes = gridStage.getChildByName('notesContainer')
    if (existingNotes) {
      gridStage.removeChild(existingNotes)
    }

    const notesContainer = new PIXI.Container()
    notesContainer.name = 'notesContainer'

    notes.forEach((note) => {
      const x = ticksToPixels(note.position)
      const width = ticksToPixels(note.duration)
      const y = (TOTAL_KEYS - note.tone - 1) * KEY_HEIGHT

      // Draw note rectangle
      const noteGraphics = new PIXI.Graphics()
      noteGraphics.beginFill(0xffd700)
      noteGraphics.lineStyle(1, 0x000000)
      noteGraphics.drawRect(x, y, width, KEY_HEIGHT)
      noteGraphics.endFill()

      // Add lyric text
      const lyricText = new PIXI.Text(note.lyric, {
        fontFamily: 'Arial',
        fontSize: 8,
        fill: 0x000000,
        align: 'center',
      })
      lyricText.anchor.set(0.5, 0.5)
      lyricText.x = x + width / 2
      lyricText.y = y + KEY_HEIGHT / 2

      notesContainer.addChild(noteGraphics)
      notesContainer.addChild(lyricText)

      // Draw pitch curve if it exists
      if (note.pitch?.data) {
        const pitchLine = new PIXI.Graphics()
        pitchLine.lineStyle(1, 0xff0000)
        
        note.pitch.data.forEach((point, index) => {
          const pointX = x + ticksToPixels(point.x)
          const pointY = y + (point.y / 100) * KEY_HEIGHT
          
          if (index === 0) {
            pitchLine.moveTo(pointX, pointY)
          } else {
            pitchLine.lineTo(pointX, pointY)
          }
        })

        notesContainer.addChild(pitchLine)
      }
    })

    gridStage.addChild(notesContainer)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = yaml.load(text) as UstxData
      setUstxData(data)
      setCurrentBPM(data.bpm)
      setResolution(data.resolution)

      if (data.voice_parts?.[0]?.notes) {
        drawNotes(data.voice_parts[0].notes)
      }
    } catch (error) {
      console.error('Error parsing USTX file:', error)
    }
  }

  useEffect(() => {
    if (!pianoContainerRef.current || !gridContainerRef.current || pianoAppRef.current || gridAppRef.current) return

    // Initialize PIXI Applications
    const pianoApp = new PIXI.Application({
      backgroundColor: 0x2c2c2c,
      width: PIANO_WIDTH,
      height: totalHeight,
      antialias: true,
    })
    pianoAppRef.current = pianoApp
    pianoContainerRef.current.appendChild(pianoApp.view as HTMLCanvasElement)

    const gridApp = new PIXI.Application({
      backgroundColor: 0x2c2c2c,
      width: gridContainerRef.current.clientWidth,
      height: totalHeight,
      antialias: true,
    })
    gridAppRef.current = gridApp
    gridContainerRef.current.appendChild(gridApp.view as HTMLCanvasElement)

    // Initial draw
    drawPianoKeys()
    drawGrid(gridApp.screen.width)

    // Sync scrolling
    const handleScroll = debounce((e: Event) => {
      const source = e.target as HTMLElement
      const target = source === pianoContainerRef.current 
        ? gridContainerRef.current 
        : pianoContainerRef.current

      if (target) {
        target.scrollTop = source.scrollTop
      }
    }, 16)

    pianoContainerRef.current.addEventListener('scroll', handleScroll)
    gridContainerRef.current.addEventListener('scroll', handleScroll)

    // Cleanup
    return () => {
      pianoContainerRef.current?.removeEventListener('scroll', handleScroll)
      gridContainerRef.current?.removeEventListener('scroll', handleScroll)
      pianoApp.destroy(true)
      gridApp.destroy(true)
    }
  }, [])

  return (
    <main className="min-h-screen p-4 bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Piano Roll Editor</h1>
        <div className="space-x-2">
          <input
            type="file"
            accept=".ustx"
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
        </div>
      </div>
      <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden flex">
        <div
          ref={pianoContainerRef}
          className="overflow-y-auto"
          style={{
            width: `${PIANO_WIDTH}px`,
            maxHeight: '600px',
            overflowX: 'hidden',
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