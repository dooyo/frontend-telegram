import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { MediaFileType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  PlayIcon,
  PauseIcon,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaCarouselProps {
  mediaFiles: MediaFileType[];
  className?: string;
  isExpanded?: boolean;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  mediaFiles,
  className,
  isExpanded = false
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // Minimum distance required for a swipe
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!mediaFiles || mediaFiles.length === 0) {
    return null;
  }

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = () => {
    setIsLoading(false);
    setError('Failed to load media');
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaFiles.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setActiveIndex((prev) => (prev < mediaFiles.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && mediaFiles.length > 1) {
      // Swiped left, go to next
      setDirection(1);
      handleNext(e as unknown as React.MouseEvent);
    } else if (isRightSwipe && mediaFiles.length > 1) {
      // Swiped right, go to previous
      setDirection(-1);
      handlePrevious(e as unknown as React.MouseEvent);
    }

    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    if (info.offset.x < -100 && activeIndex < mediaFiles.length - 1) {
      setDirection(1);
      setActiveIndex(activeIndex + 1);
    } else if (info.offset.x > 100 && activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = document.getElementById(
      `video-${activeIndex}`
    ) as HTMLVideoElement;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleImageClick = (e: React.MouseEvent, url: string) => {
    if (isDragging) return; // Don't open fullscreen if dragging
    e.stopPropagation();
    setFullScreenImage(url);
  };

  const closeFullScreenImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullScreenImage(null);
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0
      };
    }
  };

  if (error) {
    return (
      <div className="text-sm text-destructive p-2 rounded-lg bg-destructive/10">
        {error}
      </div>
    );
  }

  return (
    <>
      <div
        className={cn('relative rounded-lg overflow-hidden', className)}
        ref={carouselRef}
      >
        {/* Loading state */}
        {isLoading && (
          <Skeleton
            className={cn(
              'w-full rounded-lg',
              isExpanded ? 'h-[512px]' : 'h-[300px]'
            )}
          />
        )}

        {/* Media display with animation */}
        <div className={cn('relative', isLoading && 'hidden')}>
          <div
            className="w-full overflow-hidden rounded-lg"
            style={{ height: isExpanded ? '512px' : '300px' }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full h-full"
                drag={mediaFiles.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {mediaFiles[activeIndex].type === 'image' ? (
                  <img
                    src={mediaFiles[activeIndex].url}
                    alt={`Media ${activeIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onLoad={handleLoadSuccess}
                    onError={handleLoadError}
                    onClick={(e) =>
                      handleImageClick(e, mediaFiles[activeIndex].url)
                    }
                  />
                ) : (
                  <div className="relative group h-full">
                    <video
                      id={`video-${activeIndex}`}
                      src={mediaFiles[activeIndex].url}
                      className="w-full h-full object-cover"
                      onLoadedData={handleLoadSuccess}
                      onError={handleLoadError}
                      loop
                      muted
                      playsInline
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute inset-0 m-auto w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleTogglePlay}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-6 h-6" />
                      ) : (
                        <PlayIcon className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons (only show if more than one file) */}
          {mediaFiles.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background border shadow-sm z-10"
                onClick={handlePrevious}
                aria-label="Previous media"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background border shadow-sm z-10"
                onClick={handleNext}
                aria-label="Next media"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Pagination indicators */}
          {mediaFiles.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
              {mediaFiles.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === activeIndex
                      ? 'bg-primary'
                      : 'bg-background/50 hover:bg-background/80'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(index > activeIndex ? 1 : -1);
                    setActiveIndex(index);
                  }}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full screen image modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeFullScreenImage}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/20 hover:bg-background/40"
            onClick={closeFullScreenImage}
            aria-label="Close full screen view"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
          <img
            src={fullScreenImage}
            alt="Full size view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
