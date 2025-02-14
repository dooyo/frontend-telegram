import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { getProfilesSearch } from '@/lib/api/profiles';
import { MediaPreview } from '@/components/MediaPreview/MediaPreview';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getMediaType } from '@/lib/utils/urlUtils';

interface ContentTextProps {
  text: string;
  className?: string;
  showPreviews?: boolean;
  isExpanded?: boolean;
  onPostClick?: () => void;
}

export const ContentText: React.FC<ContentTextProps> = ({
  text,
  className,
  showPreviews = true,
  isExpanded = false,
  onPostClick
}) => {
  const navigate = useNavigate();
  const { urls, error, retryFetch } = useUrlDetection(text);

  const handleMentionClick = async (username: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Remove @ from username
      const cleanUsername = username.substring(1);
      const results = await getProfilesSearch(cleanUsername);
      const exactMatch = results.find(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (exactMatch) {
        navigate(`/profile/${exactMatch._id}`);
      } else {
        console.warn(`User ${username} not found`);
      }
    } catch (error) {
      console.error('Error resolving username:', error);
    }
  };

  const handleUrlClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const url = e.currentTarget.href;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleContentClick = () => {
    if (onPostClick) {
      onPostClick();
    }
  };

  // Split text into parts, preserving mentions and URLs
  const parts = text
    .split(/(@[\w]+|https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g)
    .map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <a
            key={index}
            href={`#${part}`}
            onClick={(e) => handleMentionClick(part, e)}
            className={cn(
              'text-primary hover:underline cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary focus-offset-2',
              'rounded-sm'
            )}
            tabIndex={0}
            role="link"
            aria-label={`View ${part}'s profile`}
          >
            {part}
          </a>
        );
      } else if (part.match(/^https?:\/\//)) {
        // Check if it's a media URL
        const mediaType = getMediaType(part);
        if (mediaType !== 'URL') {
          // Don't render media URLs in text
          return null;
        }
        return (
          <a
            key={index}
            href={part}
            onClick={handleUrlClick}
            className="text-blue-500 hover:underline cursor-pointer"
            tabIndex={0}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${part} in new tab`}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    })
    .filter(Boolean); // Remove null values (hidden media URLs)

  return (
    <div className={className} onClick={handleContentClick}>
      <p className="whitespace-pre-wrap break-words">{parts}</p>
      {showPreviews && (urls.length > 0 || error) && (
        <div className="mt-2 space-y-2">
          {error && (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground bg-muted/50 rounded-md">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  retryFetch();
                }}
                className="h-7 px-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          )}
          {urls
            .filter(
              (metadata) =>
                metadata.type !== 'URL' ||
                metadata.description ||
                (metadata.image && metadata.title)
            )
            .map((metadata, index) => (
              <MediaPreview
                key={`${metadata.url}-${index}`}
                metadata={metadata}
                isExpanded={isExpanded}
              />
            ))}
        </div>
      )}
    </div>
  );
};
