import { cn } from '@/lib/utils/cn';
import {
  NavLink as RouterNavLink,
  type NavLinkProps as RouterNavLinkProps
} from 'react-router-dom';

interface NavLinkProps extends Omit<RouterNavLinkProps, 'className'> {
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

export const NavLink = ({ icon, label, className, ...props }: NavLinkProps) => {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center w-full h-full transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground hover:text-primary',
          className
        )
      }
      aria-label={label}
      role="link"
      tabIndex={0}
    >
      {icon && <div className="h-6 w-6">{icon}</div>}
      <span className="text-xs mt-1">{label}</span>
    </RouterNavLink>
  );
};
