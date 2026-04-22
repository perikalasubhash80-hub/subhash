import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play } from 'lucide-react';
import { Point, Direction } from '../types';

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 2;

export default function SnakeGame({ onScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection('RIGHT');
    setGameState('PLAYING');
    setScore(0);
    onScoreUpdate(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (direction) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Collision Check (Walls)
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameState('GAME_OVER');
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food Check
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const nextScore = s + 10;
            onScoreUpdate(nextScore);
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake-high-score', nextScore.toString());
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(score / 50) * SPEED_INCREMENT);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [gameState, direction, food, score, generateFood, onScoreUpdate, highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width / GRID_SIZE;

    // Clear - No background fill here, using grid-bg class on parent
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Food (Apple)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff003c';
    ctx.fillStyle = '#ff003c';
    ctx.beginPath();
    ctx.arc(
      food.x * size + size / 2,
      food.y * size + size / 2,
      size / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#39ff14';
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#39ff14' : 'rgba(57, 255, 20, 0.6)';
      ctx.fillRect(segment.x * size + 1, segment.y * size + 1, size - 2, size - 2);
      if (index === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(segment.x * size + 1, segment.y * size + 1, size - 2, size - 2);
      }
    });

    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="relative">
      <div className="relative bg-transparent rounded-lg overflow-hidden flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full h-auto cursor-none"
        />

        <AnimatePresence>
          {gameState !== 'PLAYING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
            >
              {gameState === 'GAME_OVER' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8"
                >
                  <h2 className="text-4xl font-display font-bold text-neon-pink mb-2 tracking-tighter italic uppercase">Connection Lost</h2>
                  <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Score: {score}</p>
                </motion.div>
              )}

              <button
                onClick={resetGame}
                className="group relative px-10 py-3 bg-transparent overflow-hidden rounded transition-all"
              >
                <div className="absolute inset-0 border neon-border-cyan rounded shadow-[0_0_15px_rgba(0,243,255,0.2)]"></div>
                <div className="relative flex items-center gap-3 text-cyan-400 font-mono font-bold text-xs tracking-[0.3em] uppercase">
                  {gameState === 'IDLE' ? <Play className="w-3 h-3 fill-current" /> : <RotateCcw className="w-3 h-3" />}
                  {gameState === 'IDLE' ? 'Initialize' : 'Reboot'}
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
