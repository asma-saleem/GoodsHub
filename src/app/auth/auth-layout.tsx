'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center bg-[#E9ECEF] w-full">
        {children}

    </div>
  );
}
