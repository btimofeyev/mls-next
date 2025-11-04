import Link from 'next/link';
import { AdminPageWrapper } from '@/app/admin/components/AdminPageWrapper';
import { Surface } from '@/components/ui/Surface';

const actions = [
  {
    href: '/admin/matches',
    title: 'Manage Matches',
    description: 'Review and edit submitted fixtures. Update scores or goal logs immediately.',
    icon: '📅',
  },
  {
    href: '/admin/players',
    title: 'Manage Players',
    description: 'Edit roster info or deactivate players that leave the squad.',
    icon: '🧾',
  },
  {
    href: '/admin/add-match',
    title: 'Add Match Result',
    description: 'Record final scores with goal attribution as soon as the whistle blows.',
    icon: '⚽',
  },
  {
    href: '/admin/add-player',
    title: 'Add Player',
    description: 'Register a new player and tie them to their club roster.',
    icon: '🆕',
  },
  {
    href: '/admin/add-headline',
    title: 'Post Headline',
    description: 'Share quick recaps or breaking storylines for the home dashboard.',
    icon: '📰',
  },
];

export default function AdminDashboardPage() {
  return (
    <AdminPageWrapper>
      <div className="admin-dashboard-grid">
        <section className="admin-dashboard-panel" aria-labelledby="admin-quick-actions-heading">
          <header className="admin-dashboard-panel-header">
            <h2 id="admin-quick-actions-heading">Quick actions</h2>
            <p>Dispatch updates, refine rosters, and keep the public dashboard current in a few taps.</p>
          </header>
          <nav aria-label="Admin quick actions">
            <ul className="admin-dashboard-actions">
              {actions.map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="admin-dashboard-action-link"
                  >
                    <Surface
                      padding="lg"
                      variant="transparent"
                      hover
                      interactive
                      className="admin-dashboard-action-card"
                    >
                      <div className="admin-dashboard-action-header">
                        <span className="admin-dashboard-action-icon">
                          {action.icon}
                        </span>
                        <h3>{action.title}</h3>
                      </div>
                      <p>{action.description}</p>
                      <span className="admin-dashboard-action-cta">
                        Open →
                      </span>
                    </Surface>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

      </div>
    </AdminPageWrapper>
  );
}
