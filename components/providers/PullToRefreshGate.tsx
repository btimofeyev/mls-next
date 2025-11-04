'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';

type PullToRefreshGateProps = {
  enabled?: boolean;
};

export function PullToRefreshGate({ enabled = true }: PullToRefreshGateProps) {
  usePullToRefresh(enabled);
  return null;
}
