'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AdminNavLink = {
  href: string;
  label: string;
};

type AdminNavProps = {
  links: AdminNavLink[];
};

export function AdminNav({ links }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="admin-dashboard-nav" aria-label="Admin navigation">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-dashboard-nav-link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
