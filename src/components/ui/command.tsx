import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface CommandContextValue {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onSelect?: (value: string) => void;
}

const CommandContext = React.createContext<CommandContextValue>({
  selectedIndex: -1,
  setSelectedIndex: () => {}
});

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  return (
    <CommandContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      <div
        ref={ref}
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
});
Command.displayName = 'Command';

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-icon-default)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = 'CommandInput';

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));
CommandList.displayName = 'CommandList';

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div ref={ref} className="py-6 text-center text-sm" {...props} />
));
CommandEmpty.displayName = 'CommandEmpty';

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('overflow-hidden p-1 text-foreground', className)}
    {...props}
  />
));
CommandGroup.displayName = 'CommandGroup';

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }
>(({ className, onSelect, ...props }, _ref) => {
  const { selectedIndex } = React.useContext(CommandContext);
  const itemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (itemRef.current) {
      const items = Array.from(itemRef.current.parentElement?.children || []);
      const index = items.indexOf(itemRef.current);
      if (index === selectedIndex && onSelect) {
        onSelect();
      }
    }
  }, [selectedIndex, onSelect]);

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      role="option"
      aria-selected={
        selectedIndex ===
        Array.from(itemRef.current?.parentElement?.children || []).indexOf(
          itemRef.current as Element
        )
      }
      onClick={onSelect}
      {...props}
    />
  );
});
CommandItem.displayName = 'CommandItem';

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
};
