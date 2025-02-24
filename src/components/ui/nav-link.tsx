import { cn } from '@/lib/utils/cn';
import {
  NavLink as RouterNavLink,
  type NavLinkProps as RouterNavLinkProps
} from 'react-router-dom';

interface NavLinkProps extends Omit<RouterNavLinkProps, 'className'> {
  icon?: React.ReactNode;
  label: string;
  className?: string | (({ isActive }: { isActive: boolean }) => string);
}

export const NavLink = ({ icon, label, className, ...props }: NavLinkProps) => {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) =>
        typeof className === 'function'
          ? className({ isActive })
          : cn(
              'flex flex-col items-center space-y-1 px-3 py-1 rounded-lg transition-colors',
              isActive
                ? 'text-primary bg-white/10'
                : 'text-[var(--color-icon-default)] hover:bg-white/5',
              className
            )
      }
      aria-label={label}
      role="link"
      tabIndex={0}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </RouterNavLink>
  );
};
