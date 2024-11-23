export interface Note {
    position: number;
    duration: number;
    tone: number;
    lyric?: string;
    pitch?: {
      data: PitchPoint[];
    };
  }
  
  export interface PitchPoint {
    x: number;
    y: number;
    shape?: string;
  }
  
  export interface USTXProject {
    resolution: number;
    bpm: number;
    notes: Note[];
  }