import cron from 'node-cron';
import { fetchAndStoreStockData } from './stockService';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

// Schedule task to run at 4:30 PM EST (after market close)
// Note: Adjust the time based on your timezone
export function startDailyDataFetch() {
  console.log('Starting daily stock data fetch cron job...');
  
  // Run at 4:30 PM EST (20:30 UTC) Monday through Friday
  cron.schedule('30 20 * * 1-5', async () => {
    try {
      console.log('Executing daily stock data fetch...');
      const results = await fetchAndStoreStockData(SYMBOLS);
      console.log('Daily stock data fetch completed:', results);
    } catch (error) {
      console.error('Error in daily stock data fetch:', error);
    }
  }, {
    timezone: "America/New_York"
  });
} 