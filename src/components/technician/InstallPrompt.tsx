import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

const DISMISSED_KEY = 'tt-tech-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return; // Already installed, don't show

    // Check if user dismissed recently (24 hours)
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      // iOS doesn't fire beforeinstallprompt — show manual instructions
      setShowBanner(true);
      return;
    }

    // Chrome/Android: intercept the install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also show after a short delay if no event fires (fallback for browsers that support PWA)
    const fallbackTimer = setTimeout(() => {
      if (!standalone) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  if (!showBanner || isStandalone) return null;

  return (
    <>
    <style jsx global>{`
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `}</style>
    <div
      className="fixed inset-x-0 bottom-16 z-[60] px-4 pb-2"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <div className="bg-primary-900 text-white rounded-2xl shadow-2xl p-4 border border-primary-700">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="h-10 w-10 bg-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-primary-900" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Install TT Tech Portal</h3>

            {isIOS ? (
              <p className="text-xs text-primary-300 mt-1 leading-relaxed">
                Tap <Share className="h-3 w-3 inline -mt-0.5" /> <span className="font-medium text-white">Share</span> then{' '}
                <PlusSquare className="h-3 w-3 inline -mt-0.5" /> <span className="font-medium text-white">Add to Home Screen</span>
              </p>
            ) : deferredPrompt ? (
              <p className="text-xs text-primary-300 mt-1">
                Get quick access from your home screen
              </p>
            ) : (
              <p className="text-xs text-primary-300 mt-1 leading-relaxed">
                Open browser menu and tap <span className="font-medium text-white">Add to Home Screen</span> or <span className="font-medium text-white">Install App</span>
              </p>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="text-primary-400 hover:text-white p-1 -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Install button (only if we have the deferred prompt) */}
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full py-2.5 bg-accent-500 text-primary-900 font-bold rounded-xl text-sm hover:bg-accent-400 active:bg-accent-600 transition-colors"
          >
            Install Now
          </button>
        )}
      </div>
    </div>
    </>
  );
}
