'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type PullToRefreshOptions = {
  threshold?: number;
  cooldown?: number;
};

export function usePullToRefresh(enabled = true, options: PullToRefreshOptions = {}) {
  const { threshold = 70, cooldown = 8000 } = options;
  const router = useRouter();
  const startYRef = useRef(0);
  const triggeredRef = useRef(false);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0) {
        startYRef.current = 0;
        return;
      }
      startYRef.current = event.touches[0]?.clientY ?? 0;
      triggeredRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (triggeredRef.current || startYRef.current === 0) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = currentY - startYRef.current;

      if (delta > threshold && window.scrollY <= 0) {
        triggeredRef.current = true;
        const now = Date.now();
        if (now - lastRefreshRef.current < cooldown) {
          return;
        }

        lastRefreshRef.current = now;
        router.refresh();
        window.dispatchEvent(new CustomEvent('mls-next:pulled-to-refresh'));
      }
    };

    const handleTouchEnd = () => {
      startYRef.current = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, router, threshold, cooldown]);
}
