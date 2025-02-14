import { useState, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { UrlMetadata } from '@/lib/utils/urlUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, X } from 'lucide-react';

interface MediaPreviewProps {
  metadata: UrlMetadata;
  className?: string;
  isExpanded?: boolean;
  onRemove?: () => void;
}

export const MediaPreview = ({
  metadata,
  className,
  isExpanded = false,
  onRemove
}: MediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<HTMLVideoElement | null>(null);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = () => {
    setIsLoading(false);
    setError('Failed to load media');
  };

  const handleTogglePlay = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const renderMediaContent = () => {
    switch (metadata.type) {
      case 'IMAGE':
        return (
          <img
            src={metadata.url}
            alt="Preview"
            className={cn(
              'w-full h-full object-cover rounded-lg',
              isExpanded ? 'max-h-[512px]' : 'max-h-[256px]'
            )}
            onLoad={handleLoadSuccess}
            onError={handleLoadError}
          />
        );

      case 'VIDEO':
        return (
          <div className="relative group">
            <video
              ref={mediaRef}
              src={metadata.url}
              className={cn(
                'w-full rounded-lg',
                isExpanded ? 'max-h-[512px]' : 'max-h-[256px]'
              )}
              onLoadedData={handleLoadSuccess}
              onError={handleLoadError}
              loop
              muted
              playsInline
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
        );

      case 'GIF':
        return (
          <div className="relative group">
            <img
              src={metadata.url}
              alt="GIF Preview"
              className={cn(
                'w-full h-full object-cover rounded-lg',
                isExpanded ? 'max-h-[512px]' : 'max-h-[256px]'
              )}
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
            />
          </div>
        );

      case 'URL':
        return (
          <div className="flex items-start space-x-4 p-4 border rounded-lg bg-card">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">
                {metadata.title || metadata.url}
              </h3>
              {metadata.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {metadata.description}
                </p>
              )}
              {metadata.siteName && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {metadata.siteName}
                </p>
              )}
            </div>
            {metadata.image && (
              <img
                src={metadata.image}
                alt="Site preview"
                className="w-20 h-20 object-cover rounded"
                onLoad={handleLoadSuccess}
                onError={handleLoadError}
              />
            )}
          </div>
        );
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
    <div className={cn('relative group', className)}>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-background border shadow-sm opacity-70 hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove preview"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isLoading && (
        <Skeleton
          className={cn(
            'w-full rounded-lg',
            isExpanded ? 'h-[512px]' : 'h-[256px]'
          )}
        />
      )}
      <div className={cn(isLoading && 'hidden')}>{renderMediaContent()}</div>
    </div>
  );
};
