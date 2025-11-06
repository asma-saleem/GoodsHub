'use client';

import React from 'react';
import AdminLayout from './admin-layout/admin-layout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
