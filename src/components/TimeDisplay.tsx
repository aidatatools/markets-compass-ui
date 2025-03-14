'use client';

import { useEffect, useState } from 'react';

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Initial alignment to the start of the next minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    // First timeout to align with the start of the next minute
    const initialTimeout = setTimeout(() => {
      setCurrentTime(new Date());
      
      // Then start the interval at the beginning of each minute
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // 60000ms = 1 minute
      
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(initialTimeout);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date, timeZone: string) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
      timeZoneName: 'short',
    });
  };

  const easternDate = formatDate(currentTime);
  const easternTime = formatTime(currentTime, 'America/New_York');
  const localTime = formatTime(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span className="font-mono">{easternDate}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Eastern:</span>
        <span className="font-mono">{easternTime}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Local:</span>
        <span className="font-mono">{localTime}</span>
      </div>
    </div>
  );
} 