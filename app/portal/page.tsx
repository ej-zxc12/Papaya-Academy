'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/portal/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3E2A] to-green-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to portal login...</p>
      </div>
    </div>
  );
}
