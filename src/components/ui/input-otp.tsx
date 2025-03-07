import * as React from 'react';
import { DashIcon } from '@radix-ui/react-icons';
import { OTPInput, OTPInputContext } from 'input-otp';

import { cn } from '@/lib/utils/cn';

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-disabled:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        // 'relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        // isActive && 'z-10 ring-1 ring-ring',
        // our version below
        'group relative flex items-center justify-center bg-[#DFDAD6] border border-[#cbc3be] rounded-[10px] w-11 h-11 text-center text-base transition-all',
        'hover:border-[#7a6d64] focus:border-[#7a6d64] focus:outline-hidden focus:ring-1 focus:ring-[#7a6d64]',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <DashIcon />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
