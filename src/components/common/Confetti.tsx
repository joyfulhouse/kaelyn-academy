'use client';

import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: string;
  animationDelay: string;
  backgroundColor: string;
  rotation: number;
}

const COLORS = [
  '#FF7F6B', // coral
  '#8FBC8F', // sage
  '#FFD93D', // yellow
  '#7EB5D6', // sky
  '#FFB5A7', // coral-light
  '#B8D4B8', // sage-light
];

export function Confetti({ duration = 3000, count = 50 }: { duration?: number; count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Generate pieces only on client side
    const newPieces = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
    }));
    setPieces(newPieces);
  }, [count]);

  if (pieces.length === 0) return null;

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 h-3 w-3 rounded-sm opacity-0"
          style={{
            left: piece.left,
            backgroundColor: piece.backgroundColor,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confettiFall ${duration}ms linear forwards`,
            animationDelay: piece.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
