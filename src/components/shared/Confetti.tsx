import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

const COLORS = ['#d4a373', '#5d4037', '#e8c9a0', '#f4efe6', '#b8864f', '#7b5e50', '#ff9a9e', '#ffd1dc'];

export default function Confetti({ duration = 3000 }: { duration?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const generated: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }));
    setPieces(generated);

    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            ['--fall-duration' as string]: `${p.duration}s`,
            ['--fall-delay' as string]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
