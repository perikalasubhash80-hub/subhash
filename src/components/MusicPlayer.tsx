import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon, ListMusic, Maximize2 } from 'lucide-react';
import { Track } from '../types';

export const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'AI Synth-Wave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '2',
    title: 'Cyber Pulse',
    artist: 'AI Bass Drive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '3',
    title: 'Digital Drift',
    artist: 'AI Ambient',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=300'
  }
];

interface MusicContextProps {
  currentTrackIndex: number;
  isPlaying: boolean;
  progress: number;
  onTrackSelect: (index: number) => void;
  onTogglePlay: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
}

export function MusicQueue({ currentTrackIndex, isPlaying, onTrackSelect }: Partial<MusicContextProps>) {
  return (
    <div className="flex-1 bg-zinc-900/40 p-4 neon-border-cyan rounded-lg flex flex-col overflow-hidden">
      <h2 className="text-xs uppercase tracking-[0.2em] mb-4 text-cyan-400 flex items-center gap-2">
        <ListMusic className="w-3 h-3" /> AUDIO QUEUE
      </h2>
      <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {DUMMY_TRACKS.map((track, idx) => (
          <button
            key={track.id}
            onClick={() => onTrackSelect?.(idx)}
            className={`w-full p-3 rounded text-left transition-all flex items-center justify-between group ${
              currentTrackIndex === idx 
                ? 'bg-cyan-500/10 border border-cyan-500/30' 
                : 'bg-zinc-800/40 border border-zinc-700/50 hover:border-zinc-500'
            }`}
          >
            <div className="min-w-0">
              <p className={`text-sm font-bold truncate ${currentTrackIndex === idx ? 'text-white' : 'text-zinc-400'}`}>
                {track.title}
              </p>
              <p className={`text-[10px] italic uppercase truncate ${currentTrackIndex === idx ? 'text-cyan-400/70' : 'text-zinc-600'}`}>
                {track.artist}
              </p>
            </div>
            {currentTrackIndex === idx && isPlaying ? (
              <div className="flex gap-[2px] items-end h-3">
                <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-cyan-400" />
                <motion.div animate={{ height: [8, 4, 16] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-cyan-400" />
                <motion.div animate={{ height: [4, 16, 8] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-cyan-400" />
              </div>
            ) : (
              <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400">03:00</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="flex justify-between items-end mb-2">
          <div className="text-[10px] uppercase text-zinc-500">BPM: {120 + currentTrackIndex * 4}</div>
          <div className="text-[10px] uppercase text-zinc-500">KEY: {['D min', 'A maj', 'E phryg'][currentTrackIndex % 3]}</div>
        </div>
        <div className="w-full h-2 bg-zinc-950 border border-zinc-800 rounded relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-cyan-500/20 border-r border-cyan-500"></div>
        </div>
      </div>
    </div>
  );
}

export function MusicControls({ currentTrackIndex, isPlaying, progress, onTogglePlay, onSkipForward, onSkipBackward }: Partial<MusicContextProps>) {
  const currentTrack = DUMMY_TRACKS[currentTrackIndex || 0];
  
  return (
    <footer className="h-24 bg-zinc-950 border-t border-zinc-800 flex items-center px-10 gap-12 relative z-50">
      <div className="flex flex-col gap-1 w-48 shrink-0">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <MusicIcon className="w-3 h-3" /> NOW PLAYING
        </p>
        <p className="text-sm font-bold text-white truncate neon-text-cyan">{currentTrack.title}</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-4 max-w-2xl mx-auto">
        <div className="flex justify-center gap-8 items-center">
          <button onClick={onSkipBackward} className="text-zinc-600 hover:text-cyan-400 transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full border border-cyan-500 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_#00f3ff22] hover:bg-cyan-500/10 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button onClick={onSkipForward} className="text-zinc-600 hover:text-cyan-400 transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-600">01:14</span>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: `${progress}%` }}
              className="h-full bg-cyan-500 shadow-[0_0_8px_#00f3ff]" 
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-600">02:45</span>
        </div>
      </div>

      <div className="flex items-center gap-6 w-48 justify-end shrink-0">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-zinc-600" />
          <div className="w-24 h-1 bg-zinc-800 rounded-full relative overflow-hidden">
            <div className="w-3/4 h-full bg-zinc-500"></div>
          </div>
        </div>
        <button className="text-zinc-600 hover:text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}

export default function MusicPlayer() {
  return null;
}
