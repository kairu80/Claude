import React, { useEffect, useState } from 'react';

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: 'square' | 'circle' | 'star';
}

const COLORS = ['#f59e0b', '#ec4899', '#7c3aed', '#10b981', '#3b82f6', '#ef4444', '#f97316'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function Confetti({ onDone }: { onDone?: () => void }) {
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: randomBetween(5, 95),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(8, 14),
      delay: randomBetween(0, 0.6),
      duration: randomBetween(1.2, 2.2),
      shape: (['square', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
    }))
  );

  useEffect(() => {
    const maxDuration = Math.max(...pieces.map(p => p.delay + p.duration)) * 1000 + 200;
    const timer = setTimeout(() => onDone?.(), maxDuration);
    return () => clearTimeout(timer);
  }, [pieces, onDone]);

  return (
    <div className="confetti-container" aria-hidden>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.shape === 'star' ? p.size : p.size,
            backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: p.shape === 'star' ? p.size * 1.2 : undefined,
            color: p.shape === 'star' ? p.color : undefined,
          }}
        >
          {p.shape === 'star' ? '★' : null}
        </div>
      ))}
    </div>
  );
}

export function CelebrationOverlay({
  message,
  subMessage,
  points,
  onDone,
}: {
  message: string;
  subMessage?: string;
  points?: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <>
      <Confetti />
      <div
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        aria-live="polite"
      >
        <div className="text-center animate-bounce-in">
          <div className="text-7xl mb-3 animate-wiggle">🎉</div>
          <div className="bg-white rounded-3xl shadow-2xl px-8 py-5 border-4 border-yellow-400">
            <p className="text-3xl font-black text-purple-700">{message}</p>
            {subMessage && <p className="text-lg text-gray-600 mt-1">{subMessage}</p>}
            {points !== undefined && (
              <div className="mt-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 font-bold px-4 py-1 rounded-full text-xl">
                <span>+{points}</span>
                <span>✨</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
