/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import SnakeGame from './components/SnakeGame';
import { MusicQueue, MusicControls, DUMMY_TRACKS } from './components/MusicPlayer';

export default function App() {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(DUMMY_TRACKS[currentTrackIndex].url);
    } else {
      audioRef.current.src = DUMMY_TRACKS[currentTrackIndex].url;
    }
    
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const p = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    };

    const handleEnded = () => {
      skipForward();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);
    if (score > highScore) {
      setHighScore(score);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-dark-bg text-zinc-300 font-mono overflow-hidden">
      {/* Header Navigation */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></div>
          <h1 className="text-xl font-bold tracking-tighter neon-text-cyan uppercase font-display">Synth-Snake v1.0.4</h1>
        </div>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-neon-green animate-pulse" />
            Session: Active
          </span>
          <span>Buffer: Optimized</span>
          <span className="text-zinc-300">Latency: 14ms</span>
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6 min-h-0 bg-dark-bg">
        {/* Sidebar: Music Player & Score */}
        <section className="w-80 flex flex-col gap-6 shrink-0 h-full">
          <MusicQueue 
            currentTrackIndex={currentTrackIndex} 
            isPlaying={isPlaying} 
            onTrackSelect={(idx) => {
              setCurrentTrackIndex(idx);
              setIsPlaying(true);
            }} 
          />

          <div className="h-32 bg-zinc-900/40 p-4 border border-zinc-800 rounded-lg shrink-0 flex flex-col justify-center items-center">
            <h2 className="text-xs uppercase tracking-[0.2em] mb-2 text-zinc-500 text-center">Scoreboard</h2>
            <div className="text-center">
              <div className="text-4xl font-bold neon-text-cyan font-display tabular-nums">
                {currentScore.toString().padStart(6, '0')}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 uppercase">High Score: {highScore.toString().padStart(6, '0')}</div>
            </div>
          </div>
        </section>

        {/* Main Window: Snake Game */}
        <section className="flex-1 bg-zinc-950 neon-border-pink rounded-xl relative overflow-hidden grid-bg flex flex-col items-center justify-center">
          <div className="absolute top-4 right-6 text-pink-500 text-[10px] uppercase font-bold animate-pulse italic">System: Level {Math.floor(currentScore / 100) + 1}</div>
          
          <div className="z-10 w-full flex flex-col items-center">
            <SnakeGame onScoreUpdate={handleScoreUpdate} />
          </div>

          <div className="absolute bottom-4 left-6 flex gap-4 text-zinc-600">
            <div className="text-[9px] uppercase tracking-tighter">[Arrows] Movement Control</div>
            <div className="text-[9px] uppercase tracking-tighter">[Auto] Rhythm Escalation</div>
          </div>
        </section>
      </main>

      {/* Player Controls Footer */}
      <MusicControls 
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlaying}
        progress={progress}
        onTogglePlay={togglePlay}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
      />
    </div>
  );
}
