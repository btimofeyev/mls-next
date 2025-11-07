import Link from 'next/link';
import { Surface } from '@/components/ui/Surface';

export const metadata = {
  title: 'Thank you for supporting MLS NEXT Pulse',
};

export default function SupportThanksPage() {
  return (
    <div className="dashboard-shell support-thanks-page">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-content">
        <Surface variant="solid" padding="xl" rounded="2xl" className="dashboard-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🙏</span>
            <h1>Thanks for supporting MLS NEXT Pulse</h1>
            <p>
              Your contribution helps us cover hosting costs and keep player stories flowing throughout the season. We truly
              appreciate it.
            </p>
            <Link href="/" className="panel-link">
              Back to dashboard →
            </Link>
          </div>
        </Surface>
      </div>
    </div>
  );
}
