'use client';

import { useState } from 'react';
import styles from './SupportWidget.module.css';

type SupportPlan = 'one_time' | 'monthly';

const SUPPORT_LINKS: Record<SupportPlan, string | undefined> = {
  one_time: process.env.NEXT_PUBLIC_SUPPORT_ONETIME_URL,
  monthly: process.env.NEXT_PUBLIC_SUPPORT_MONTHLY_URL,
};

export function SupportWidget() {
  const [plan, setPlan] = useState<SupportPlan>('one_time');
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);

  const handleSupportClick = () => {
    setError(null);
    const url = SUPPORT_LINKS[plan];
    if (!url) {
      setError('Support links are not configured yet.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (dismissed) {
    return (
      <button
        type="button"
        className={styles.reopenButton}
        onClick={() => setDismissed(false)}
      >
        ☕ Support MLS NEXT Pulse
      </button>
    );
  }

  return (
    <div className={styles.widget}>
      <button
        type="button"
        className={styles.closeButton}
        aria-label="Hide support widget"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>

      <div>
        <p className={styles.title}>Buy us a coffee</p>
        <p className={styles.description}>
          Keep MLS NEXT Pulse free for families. Pick a one-time boost or become a monthly supporter.
        </p>
      </div>

      <div className={styles.planToggle}>
        <button
          type="button"
          className={`${styles.planOption} ${plan === 'one_time' ? styles.planOptionActive : ''}`}
          onClick={() => setPlan('one_time')}
        >
          <span className={styles.planLabel}>One-time supporter</span>
          <span className={styles.planPrice}>Custom amount</span>
        </button>
        <button
          type="button"
          className={`${styles.planOption} ${plan === 'monthly' ? styles.planOptionActive : ''}`}
          onClick={() => setPlan('monthly')}
        >
          <span className={styles.planLabel}>Monthly supporter</span>
          <span className={styles.planPrice}>$4.99 / mo</span>
        </button>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <button
        type="button"
        className={styles.button}
        onClick={handleSupportClick}
      >
        {plan === 'one_time' ? 'Choose a one-time gift' : 'Become a monthly supporter'}
      </button>
    </div>
  );
}
