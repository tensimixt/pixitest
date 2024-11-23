export interface UstxData {
    name: string
    comment: string
    output_dir: string
    cache_dir: string
    ustx_version: string
    resolution: number
    bpm: number
    beat_per_bar: number
    beat_unit: number
    expressions: { [key: string]: Expression }
    time_signatures: TimeSignature[]
    tempos: Tempo[]
    tracks: Track[]
    voice_parts: VoicePart[]
  }
  
  export interface Expression {
    name: string
    abbr: string
    type: string
    min: number
    max: number
    default_value: number
    is_flag: boolean
    flag: string
    options?: string[]
  }
  
  export interface TimeSignature {
    bar_position: number
    beat_per_bar: number
    beat_unit: number
  }
  
  export interface Tempo {
    position: number
    bpm: number
  }
  
  export interface Track {
    singer?: string
    phonemizer?: string
    renderer_settings?: RendererSettings
    mute?: boolean
    solo?: boolean
    volume?: number
  }
  
  export interface RendererSettings {
    renderer?: string
  }
  
  export interface VoicePart {
    name: string
    comment: string
    track_no: number
    position: number
    notes: Note[]
  }
  
  export interface Note {
    position: number
    duration: number
    tone: number
    lyric: string
    pitch?: Pitch
    vibrato?: Vibrato
    phoneme_expressions?: any[]
    phoneme_overrides?: PhonemeOverride[]
  }
  
  export interface Pitch {
    data: PitchPoint[]
    snap_first?: boolean
  }
  
  export interface PitchPoint {
    x: number
    y: number
    shape?: string
  }
  
  export interface Vibrato {
    length: number
    period: number
    depth: number
    in: number
    out: number
    shift: number
    drift: number
  }
  
  export interface PhonemeOverride {
    index: number
    phoneme?: string
    offset?: number
  }