'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Basic gate: if no hardware JWT is found, route to the setup wizard.
    // Otherwise, direct them to their dashboard.
    const jwt = localStorage.getItem('clawshield_device_jwt');
    if (jwt) {
      router.push('/dashboard');
    } else {
      router.push('/setup');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
