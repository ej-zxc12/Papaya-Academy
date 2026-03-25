'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BodyClassProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  useEffect(() => {
    const isPortalPage = pathname.startsWith('/teacher') || pathname.startsWith('/principal');
    const isPublicPage = !isPortalPage;

    if (isPublicPage) {
      document.body.classList.add('public-website');
    } else {
      document.body.classList.remove('public-website');
    }
  }, [pathname]);

  return <>{children}</>;
}
