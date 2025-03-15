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

  const formatDateTime = (date: Date, timeZone: string) => {
    // Create a date object in the specified timezone
    const options = { timeZone };
    const tzDate = new Date(date.toLocaleString('en-US', options));
    
    // Format date as YYYY-MM-DD
    const year = tzDate.getFullYear();
    const month = String(tzDate.getMonth() + 1).padStart(2, '0');
    const day = String(tzDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Format time with timezone
    const time = date.toLocaleString('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });

    return {
      date: dateStr,
      time
    };
  };

  const eastern = formatDateTime(currentTime, 'America/New_York');
  const local = formatDateTime(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Eastern:</span>
        <span className="font-mono">{eastern.date}</span>
        <span className="font-mono">{eastern.time}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Local:</span>
        <span className="font-mono">{local.date}</span>
        <span className="font-mono">{local.time}</span>
      </div>
    </div>
  );
} 