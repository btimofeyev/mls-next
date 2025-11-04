'use client';

import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

type SWRProviderProps = {
  children: ReactNode;
};

const defaultFetcher = async (resource: RequestInfo, init?: RequestInit) => {
  const response = await fetch(resource, init);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: defaultFetcher,
        provider: () => new Map(),
        revalidateOnFocus: false,
        dedupingInterval: 10000,
        errorRetryCount: 1,
      }}
    >
      {children}
    </SWRConfig>
  );
}
