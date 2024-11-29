'use client'

import React, { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { Note } from '../types/ustx'

// Constants (you can move these to a separate constants file later)
const PIXELS_PER_TICK = 0.1 // Adjust this value to match your piano roll scale


// PhonemePanel.tsx
interface PhonemeData {
    phoneme: string;
    duration: number;
  }
  
  interface PhonemePanelProps {
    notes: Note[];
  }

    // Add the dummy function here
    const dummyGetPhonemes = (lyric: string): PhonemeData[] => {
        return lyric.split('').map((char) => ({
        phoneme: char,
        duration: 1,
        }));
    };
  
  const PhonemePanel: React.FC<PhonemePanelProps> = ({ notes }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
  
    useEffect(() => {
      if (containerRef.current) {
        // Initialize PIXI application for phoneme panel
        appRef.current = new PIXI.Application({
          width: window.innerWidth,
          height: 150, // Height for phoneme panel
          backgroundColor: 0xffffff,
        });
  
        containerRef.current.appendChild(appRef.current.view as HTMLCanvasElement);
        
        // Draw phoneme visualizations
        drawPhonemeVisualizations(notes);
  
        return () => {
          appRef.current?.destroy();
        };
      }
    }, [notes]);
  
    const drawPhonemeVisualizations = (notes: Note[]) => {
      if (!appRef.current) return;
  
      const container = new PIXI.Container();
      appRef.current.stage.addChild(container);
  
      let xOffset = 0;
      notes.forEach((note) => {
        // Get phonemes for the note (dummy function for now)
        const phonemes = dummyGetPhonemes(note.lyric);
        
        // Draw area chart for each phoneme
        const noteWidth = note.duration * PIXELS_PER_TICK;
        drawPhonemeAreaChart(container, xOffset, phonemes, noteWidth);
        
        xOffset += noteWidth;
      });
    };
  
    return (
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '150px',
          borderTop: '1px solid #ccc'
        }} 
      />
    );
  };
  
  // Helper function to draw phoneme area charts
  const drawPhonemeAreaChart = (
    container: PIXI.Container,
    xOffset: number,
    phonemes: PhonemeData[],
    totalWidth: number
  ) => {
    const height = 150;
    const totalDuration = phonemes.reduce((sum, p) => sum + p.duration, 0);
  
    let currentX = xOffset;
    phonemes.forEach((phoneme) => {
      const width = (phoneme.duration / totalDuration) * totalWidth;
      
      // Draw area
      const area = new PIXI.Graphics();
      area.beginFill(0xff9900, 0.3);
      area.lineStyle(1, 0x000000, 0.5);
      area.drawRect(currentX, 0, width, height);
      area.endFill();
  
      // Add phoneme label
      const text = new PIXI.Text(phoneme.phoneme, {
        fontSize: 12,
        fill: 0x000000,
      });
      text.x = currentX + width / 2;
      text.y = height / 2;
      text.anchor.set(0.5);
  
      container.addChild(area);
      container.addChild(text);
  
      currentX += width;
    });
  };

  export default PhonemePanel
