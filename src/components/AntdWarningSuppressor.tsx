'use client';

import { useEffect } from 'react';

export default function AntdWarningSuppressor() {
  useEffect(() => {
    const originalWarn = console.warn;

    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('[antd: compatible]')) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
