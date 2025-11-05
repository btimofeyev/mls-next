import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Surface } from '@/components/ui/Surface';
import { AdminAuthGuard } from '@/app/admin/components/AdminAuthGuard';
import { AdminAuthInfo } from '@/app/admin/components/AdminAuthInfo';
import { AdminNav } from '@/app/admin/components/AdminNav';

type AdminLayoutProps = {
  children: ReactNode;
};

const navLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/matches', label: 'Matches' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/headlines', label: 'Headlines' },
  { href: '/admin/add-match', label: 'Add Match' },
  { href: '/admin/add-player', label: 'Add Player' },
  { href: '/admin/add-headline', label: 'Add Headline' },
];

export default function ProtectedAdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthGuard>
  );
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-glow-layer" aria-hidden="true" />
      <Container width="wide" padding="xl" className="admin-dashboard-content">
        <Surface padding="xl" variant="transparent" className="admin-dashboard-hero-card">
          <div className="admin-dashboard-hero">
            <div className="admin-dashboard-hero-copy">
              <span className="admin-dashboard-eyebrow">
                Admin Dashboard
              </span>
              <h1 className="admin-dashboard-title">
                Manage MLS NEXT Pulse
              </h1>
              <p className="admin-dashboard-subtitle">
                Publish results, maintain roster data, and surface storylines for the U14 division.
              </p>
            </div>
            <div className="admin-dashboard-hero-meta">
              <Link
                href="/"
                className="admin-dashboard-view-link"
              >
                View live dashboard
              </Link>
              <div className="admin-dashboard-account">
                <AdminAuthInfo />
              </div>
            </div>
          </div>
          <AdminNav links={navLinks} />
        </Surface>

        <main className="admin-dashboard-main">{children}</main>
      </Container>
    </div>
  );
}
