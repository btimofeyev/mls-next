'use client';

import { Suspense } from 'react';
import AdminLoginPage from './AdminLoginPage';

export default function AdminLoginWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}