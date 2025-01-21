import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  opacity: number;
  scale: number;
}

interface ClockFountainProps {
  isLiked: boolean;
  x: number;
  y: number;
}

export const ClockFountain: React.FC<ClockFountainProps> = ({
  isLiked,
  x,
  y
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const numParticles = 3;
    const initialParticles: Particle[] = Array.from({
      length: numParticles
    }).map((_, i) => ({
      id: i,
      opacity: 0,
      scale: 1
    }));

    setParticles(initialParticles);

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      setParticles((prevParticles) =>
        prevParticles.map((particle, index) => {
          const delay = index * 200;
          const particleElapsed = elapsed - delay;

          if (particleElapsed < 0) return { ...particle, opacity: 0, scale: 1 };
          if (particleElapsed > 1000)
            return { ...particle, opacity: 0, scale: 3 };

          const progress = Math.min(particleElapsed / 1000, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 3);

          return {
            ...particle,
            scale: 1 + easeOutQuart * 2,
            opacity: progress < 0.5 ? 1 - progress : 0
          };
        })
      );

      if (elapsed < 1500) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [x, y, isLiked, startTime]);

  return (
    <div
      className="fixed pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transform-gpu"
          style={{
            left: x,
            top: y,
            transform: `translate(-50%, -50%) scale(${particle.scale})`,
            opacity: particle.opacity,
            color: isLiked ? '#22c55e' : '#ef4444'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      ))}
    </div>
  );
};
