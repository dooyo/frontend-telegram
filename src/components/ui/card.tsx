import React from 'react';
import { cn } from '@/lib/utils/cn';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card/50 text-card-foreground shadow-sm backdrop-blur-sm',
      className
    )}
    {...props}
  />
));

export default Card;
