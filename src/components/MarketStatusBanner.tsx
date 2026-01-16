'use client';

import { useEffect, useState } from 'react';

interface MarketHours {
  isOpen: boolean;
  nextEvent: string;
  timeUntil: string;
}

export default function MarketStatusBanner() {
  const [marketStatus, setMarketStatus] = useState<MarketHours>({
    isOpen: false,
    nextEvent: 'Market Opens',
    timeUntil: 'Calculating...',
  });

  useEffect(() => {
    const calculateMarketStatus = () => {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcDay = now.getUTCDay();

      // Convert to Eastern Time (EST/EDT)
      // EST is UTC-5, EDT is UTC-4
      // Simple approximation - in production, use a proper timezone library
      const estOffset = -5;
      let estHours = utcHours + estOffset;
      if (estHours < 0) estHours += 24;

      // Weekend check (0 = Sunday, 6 = Saturday)
      const isWeekend = utcDay === 0 || utcDay === 6;

      // Market hours: 9:30 AM - 4:00 PM EST (14:30 - 21:00 UTC)
      const marketOpenHour = 14; // 9:30 AM EST in UTC
      const marketOpenMinute = 30;
      const marketCloseHour = 21; // 4:00 PM EST in UTC
      const marketCloseMinute = 0;

      const currentTimeInMinutes = utcHours * 60 + utcMinutes;
      const openTimeInMinutes = marketOpenHour * 60 + marketOpenMinute;
      const closeTimeInMinutes = marketCloseHour * 60 + marketCloseMinute;

      let isOpen = false;
      let nextEvent = 'Market Opens';
      let minutesUntil = 0;

      if (isWeekend) {
        // Weekend - calculate time until Monday open
        const daysUntilMonday = utcDay === 0 ? 1 : 2;
        minutesUntil = (daysUntilMonday * 24 * 60) + (openTimeInMinutes - currentTimeInMinutes);
        nextEvent = 'Market Opens';
      } else if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
        // Market is open
        isOpen = true;
        nextEvent = 'Market Closes';
        minutesUntil = closeTimeInMinutes - currentTimeInMinutes;
      } else if (currentTimeInMinutes < openTimeInMinutes) {
        // Before market open today
        nextEvent = 'Market Opens';
        minutesUntil = openTimeInMinutes - currentTimeInMinutes;
      } else {
        // After market close - next open is tomorrow (or Monday if Friday)
        const daysUntilNextOpen = utcDay === 5 ? 3 : 1; // Friday = 3 days, else 1 day
        minutesUntil = (daysUntilNextOpen * 24 * 60) - (currentTimeInMinutes - openTimeInMinutes);
        nextEvent = 'Market Opens';
      }

      const hours = Math.floor(minutesUntil / 60);
      const minutes = minutesUntil % 60;
      const timeUntil = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      setMarketStatus({ isOpen, nextEvent, timeUntil });
    };

    calculateMarketStatus();
    const interval = setInterval(calculateMarketStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`${
        marketStatus.isOpen
          ? 'bg-green-500 dark:bg-green-600'
          : 'bg-red-500 dark:bg-red-600'
      } text-white py-2 px-4 text-center transition-colors duration-500`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm sm:text-base">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              marketStatus.isOpen ? 'bg-white animate-pulse' : 'bg-white'
            }`}
          />
          <span className="font-semibold">
            {marketStatus.isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>
        </div>
        <span className="text-white/90">
          {marketStatus.nextEvent} in {marketStatus.timeUntil}
        </span>
      </div>
    </div>
  );
}
