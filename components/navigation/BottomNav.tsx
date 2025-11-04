'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from './PrimaryNav';

type BottomNavProps = {
  items: NavItem[];
};

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border/20 z-fixed md:hidden">
      <nav
        aria-label="Primary navigation"
        className="flex items-center justify-around py-xs px-sm"
      >
        {items.map((item) => {
          const segments = item.segments ?? [item.href];
          const isActive = segments.some((segment) => {
            if (segment === '/') {
              return pathname === '/';
            }
            return pathname.startsWith(segment);
          });

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex flex-col items-center gap-xs px-xs py-xs rounded-sm
                transition-colors duration-fast relative
                ${isActive
                  ? 'text-accent bg-accent/10'
                  : 'text-secondary hover:text-primary hover:bg-surface-elevated'
                }
              `}
            >
              {isActive && (
                <span className="absolute -top-px left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
              )}
              <span
                aria-hidden="true"
                className={`
                  text-base leading-none
                  ${isActive ? 'scale-110' : 'scale-100'}
                  transition-transform duration-fast
                `}
              >
                {item.icon ?? '•'}
              </span>
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}