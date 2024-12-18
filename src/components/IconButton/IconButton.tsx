import { IconContext } from 'react-icons';
import {
  MdComment,
  MdAccessTime,
  MdFavorite,
  MdShare,
  MdHeartBroken
} from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const icons: { [key: string]: any } = {
  'comment-outline': MdComment,
  'clock-outline': MdAccessTime,
  'heart-outline': MdFavorite,
  'heart-off-outline': MdHeartBroken,
  'share-outline': MdShare
};

interface IconButtonProps {
  icon: keyof typeof icons;
  number?: number | string;
  onClick?: () => void;
  color?: string;
  isPressed?: boolean;
}

export const IconButton = ({
  icon,
  number,
  onClick,
  color = 'gray',
  isPressed = false
}: IconButtonProps) => {
  const IconComponent = icons[icon];

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={cn(
        'flex items-center gap-1 px-2 hover:bg-transparent',
        isPressed && 'opacity-50'
      )}
    >
      <IconContext.Provider value={{ size: '18px', color }}>
        {IconComponent && <IconComponent />}
      </IconContext.Provider>
      {number !== undefined && (
        <span className="text-xs text-muted-foreground">{number}</span>
      )}
    </Button>
  );
};
