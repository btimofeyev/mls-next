'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  href: string;
  label: string;
  icon?: string;
  segments?: string[];
};

type PrimaryNavProps = {
  items: NavItem[];
};

export function PrimaryNav({ items }: PrimaryNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-sm">
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
            className={`
              relative px-sm py-xs rounded-sm font-medium transition-all duration-fast text-sm
              ${isActive
                ? 'text-accent bg-accent/10'
                : 'text-secondary hover:text-primary hover:bg-surface-elevated'
              }
            `}
          >
            {item.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}