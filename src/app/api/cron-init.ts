import { startDailyDataFetch } from '@/services/cronService';

// Start the cron job when this module is imported
if (process.env.NODE_ENV === 'production') {
  startDailyDataFetch();
} 