import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { getProfilesSearch } from '@/lib/api/profiles';

interface ContentTextProps {
  text: string;
  className?: string;
}

export const ContentText: React.FC<ContentTextProps> = ({
  text,
  className
}) => {
  const navigate = useNavigate();

  const handleMentionClick = async (username: string, e: React.MouseEvent) => {
    e.preventDefault();
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
        // Optionally show a toast/notification that user wasn't found
      }
    } catch (error) {
      console.error('Error resolving username:', error);
    }
  };

  // Split text into parts, preserving mentions
  const parts = text.split(/(@[\w]+)/g).map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <a
          key={index}
          href={`#${part}`} // Placeholder href
          onClick={(e) => handleMentionClick(part, e)}
          className={cn(
            'text-primary hover:underline cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'rounded-sm'
          )}
          tabIndex={0}
          role="link"
          aria-label={`View ${part}'s profile`}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });

  return (
    <p className={cn('whitespace-pre-wrap break-words', className)}>{parts}</p>
  );
};
