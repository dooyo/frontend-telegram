import { FC, ReactNode, MouseEvent } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonProps = {
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export const Button: FC<ButtonProps> = ({
  disabled,
  onClick,
  children,
  className = '',
  fullWidth = false
}) => {
  return (
    <button
      className={cn(
        'bg-[#202428] text-white px-4 py-2 rounded-lg transition-colors hover:bg-[#333a45] disabled:bg-[#4d5052] disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : 'w-fit',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
