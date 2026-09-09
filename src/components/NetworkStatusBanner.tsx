import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div
        id="offline-banner"
        className="bg-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-xs z-50 sticky top-0"
      >
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span>
          You are currently offline. Local attendance records and data are preserved and functional!
        </span>
      </div>
    );
  }

  if (showReconnectedBanner) {
    return (
      <div
        id="online-restored-banner"
        className="bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-xs z-50 sticky top-0"
      >
        <Wifi className="w-4 h-4 shrink-0" />
        <span>Internet connection restored. All systems online.</span>
      </div>
    );
  }

  return null;
}
