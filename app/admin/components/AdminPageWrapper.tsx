'use client';

import { AdminAuthGuard } from './AdminAuthGuard';

type AdminPageWrapperProps = {
  children: React.ReactNode;
};

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}