import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DoorstepRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/doorstep-repair');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h1>
        <p className="text-gray-600">
          Please wait while we redirect you to the Doorstep Repair page.
        </p>
      </div>
    </div>
  );
} 