'use client';

import { useEffect, useState } from 'react';

interface PresenceIndicatorProps {
  lastSeen: Date | null | undefined;
}

export default function PresenceIndicator({ lastSeen }: PresenceIndicatorProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      if (!lastSeen) {
        setIsOnline(false);
        return;
      }

      const lastSeenDate = new Date(lastSeen).getTime();
      const now = new Date().getTime();
      const diffInMinutes = (now - lastSeenDate) / 60000;

      setIsOnline(diffInMinutes < 2);
    };

    checkStatus();

    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  if (!isOnline) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-sm font-medium text-green-600">Online</span>
    </div>
  );
}