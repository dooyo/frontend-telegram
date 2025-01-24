import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'w-full rounded-lg bg-input-background border border-input-border',
          'py-2 px-3 leading-[normal]',
          'focus:outline-hidden focus:border-input-hover focus:ring-1 focus:ring-input-hover',
          'resize-none placeholder:text-muted-foreground break-words whitespace-pre-wrap',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
