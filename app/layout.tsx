import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

import './globals.css';
import { Container } from '@/components/ui/Container';
import { PrimaryNav, type NavItem } from '@/components/navigation/PrimaryNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import { SWRProvider } from '@/components/providers/SWRProvider';
import { PullToRefreshGate } from '@/components/providers/PullToRefreshGate';
import { DEFAULT_DIVISION_ID } from '@/lib/constants';

const inter = Inter({
  subsets: [ 'latin' ],
  display: 'swap',
  variable: '--font-inter',
});

const navigation: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: '⚡',
    segments: [ '/' ],
  },
  {
    href: `/standings/${DEFAULT_DIVISION_ID}`,
    label: 'Standings',
    icon: '📊',
    segments: [ '/standings' ],
  },
  {
    href: `/leaderboard/${DEFAULT_DIVISION_ID}`,
    label: 'Leaderboard',
    icon: '🥇',
    segments: [ '/leaderboard' ],
  },
  {
    href: '/teams',
    label: 'Teams',
    icon: '🏟️',
    segments: [ '/teams' ],
  },
];

export const metadata: Metadata = {
  title: 'MLS NEXT Pulse',
  description: 'Live pulse on the MLS NEXT U14 division: standings, scorers, club insights, and admin tools.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} app-body`}>
        <SWRProvider>
          <div className="app-shell">
            <header className="app-header">
              <Container padding="md" className="app-header-inner">
                <Link
                  href="/"
                  className="app-brand group"
                  aria-label="MLS NEXT Pulse dashboard"
                >
                  <span className="app-brand-icon">
                    ⚽
                  </span>
                  <div className="app-brand-text">
                    <span className="app-brand-title">
                      MLS NEXT
                    </span>
                    <span className="app-brand-tagline">
                      Pulse
                    </span>
                  </div>
                </Link>

                <div className="app-header-actions">
                  <PrimaryNav items={navigation} />
                  <Link
                    href="/admin"
                    className="app-header-cta"
                  >
                    Admin
                  </Link>
                </div>
              </Container>
            </header>

            <main className="app-main">
              {children}
            </main>

            <footer className="app-footer">
              <Container padding="sm" className="app-footer-inner">
                <span className="app-footer-brand">
                  MLS NEXT
                </span>
                <div className="app-footer-links">
                  <Link
                    href={`/standings/${DEFAULT_DIVISION_ID}`}
                    className="app-footer-link"
                  >
                    Standings
                  </Link>
                  <span className="app-footer-separator">•</span>
                  <Link
                    href={`/leaderboard/${DEFAULT_DIVISION_ID}`}
                    className="app-footer-link"
                  >
                    Leaders
                  </Link>
                </div>
              </Container>
            </footer>
            <BottomNav items={navigation} />
          </div>

          <PullToRefreshGate />
        </SWRProvider>
      </body>
    </html>
  );
}
