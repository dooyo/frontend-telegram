import { useState, useEffect } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';
import { timeUntil } from '@/lib/helpers/timeCompute';

interface UseTimeAnimationProps {
  expiresAt: string;
}

interface UseTimeAnimationReturn {
  currentTime: string;
  timeChangeColor: string;
  isAnimating: boolean;
  handleTimeIncrease: () => void;
  handleTimeDecrease: () => void;
}

function getTimeInSeconds(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  return Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
}

export function useTimeAnimation({
  expiresAt
}: UseTimeAnimationProps): UseTimeAnimationReturn {
  const [timeChangeColor, setTimeChangeColor] = useState('gray');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeUntil(expiresAt));

  const lifetime = useMotionValue(getTimeInSeconds(expiresAt));
  const displayTime = useSpring(lifetime, {
    damping: 30,
    stiffness: 200
  });

  useEffect(() => {
    const unsubscribe = displayTime.on('change', (latest) => {
      const futureDate = new Date(Date.now() + latest * 1000).toISOString();
      setCurrentTime(timeUntil(futureDate));

      // Reset color when animation completes (velocity near zero)
      if (Math.abs(displayTime.getVelocity()) < 0.1 && isAnimating) {
        setTimeChangeColor('gray');
        setIsAnimating(false);
      }
    });
    return unsubscribe;
  }, [displayTime, isAnimating]);

  const canAnimate = () => {
    const currentSeconds = lifetime.get();
    return currentSeconds >= 3600; // 60 minutes in seconds
  };

  const handleTimeIncrease = () => {
    setIsAnimating(true);
    setTimeChangeColor('#22c55e');
    lifetime.set(lifetime.get() + 3600);
  };

  const handleTimeDecrease = () => {
    if (!canAnimate()) return;
    setIsAnimating(true);
    setTimeChangeColor('#ef4444');
    lifetime.set(lifetime.get() - 3600);
  };

  return {
    currentTime,
    timeChangeColor,
    isAnimating,
    handleTimeIncrease,
    handleTimeDecrease
  };
}
