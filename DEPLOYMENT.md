# Markets Compass UI - Netlify Deployment Guide

## Overview
Your Markets Compass UI has been enhanced with dynamic features and is optimized for Netlify deployment.

## New Features Added

### 1. Live Market Data Dashboard
- **Real-time price updates** - Auto-refreshes every 30 seconds
- **Animated ETF cards** with hover effects and gradient backgrounds
- **Sparkline mini-charts** showing 30-day price trends
- **Live statistics** including Open, High, Low, and Volume
- **Color-coded indicators** for gains (green) and losses (red)

### 2. Market Status Banner
- **Live market status** indicator (Open/Closed)
- **Countdown timer** showing time until next market event
- **Animated pulse effect** when market is open
- **Automatic timezone handling** for Eastern Time

### 3. Performance Optimizations
- **Auto-refresh** with SWR for efficient data fetching
- **Image optimization** with AVIF and WebP formats
- **Caching headers** for static assets and API responses
- **Standalone output** for better Netlify compatibility
- **Security headers** for enhanced protection

## Netlify Deployment Steps

### Step 1: Prerequisites
Ensure you have:
- A Netlify account (sign up at https://netlify.com)
- Your environment variables ready:
  - `DATABASE_URL` - PostgreSQL database connection string
  - `MONGODB_URI` - MongoDB Atlas connection string

### Step 2: Connect Repository
1. Log in to Netlify
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, Bitbucket)
4. Select your `markets-compass` repository

### Step 3: Configure Build Settings
Netlify will automatically detect your `netlify.toml` configuration. Verify these settings:

**Build command:**
```
prisma generate --no-engine && next build
```

**Publish directory:**
```
.next
```

**Base directory:**
```
markets-compass-ui
```

### Step 4: Set Environment Variables
In Netlify Dashboard → Site settings → Environment variables, add:

```
DATABASE_URL=your_postgresql_connection_string
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=/
NODE_VERSION=22
```

### Step 5: Deploy
1. Click "Deploy site"
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at `https://your-site-name.netlify.app`

### Step 6: Configure Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

## Scheduled Functions

The app includes a scheduled function to fetch stock data automatically:

**Schedule:** Monday-Friday at 5:45 PM Eastern (21:45 UTC)
**Function:** `fetch-stocks`
**Purpose:** Updates historical stock data daily after market close

This is configured in `netlify.toml` and will run automatically.

## Testing Locally

### Development Mode
```bash
cd markets-compass-ui
npm run dev
```
Visit http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

### Test Build (without starting server)
```bash
npm run build
```

## Environment Configuration

Your `netlify.toml` includes:

### Headers
- **Security headers** for XSS protection
- **Cache control** for API responses (60s with stale-while-revalidate)
- **Static asset caching** (1 year for immutable files)
- **Image caching** (1 week for JPG/PNG files)

### Functions
- External node modules bundled: `@prisma/client`, `yahoo-finance2`, `mongodb`
- Node bundler: `esbuild` for faster builds
- Prisma schema included in function bundles

## Performance Features

### Client-Side
- **SWR data fetching** with automatic revalidation
- **Sparkline charts** with SVG rendering
- **Lazy loading** for images
- **Optimistic UI updates** with loading states

### Server-Side
- **API response caching** (60 seconds)
- **Stale-while-revalidate** for seamless updates
- **Standalone Next.js output** for minimal cold starts
- **Image optimization** with modern formats

## Monitoring & Debugging

### Netlify Dashboard
1. **Deploy logs** - View build output and errors
2. **Function logs** - Monitor API and scheduled function execution
3. **Analytics** - Track site performance and visitor metrics
4. **Real-time logs** - Debug live issues

### Health Checks
- Check market status banner for live updates
- Verify ETF cards show current prices
- Test sparkline charts render correctly
- Confirm auto-refresh works (watch prices update)

## Troubleshooting

### Build Failures
**Issue:** Prisma client generation fails
**Solution:** Ensure `DATABASE_URL` is set in environment variables

**Issue:** Module not found errors
**Solution:** Run `npm install` locally and commit `package-lock.json`

### Runtime Issues
**Issue:** No data appearing on cards
**Solution:** Check API routes in Function logs, verify database connections

**Issue:** Sparklines not rendering
**Solution:** Ensure candlestick API is returning data, check browser console

### Performance Issues
**Issue:** Slow page loads
**Solution:** Verify caching headers are active, check Netlify Edge logs

## Continuous Deployment

Once connected to Git, every push to your main branch will:
1. Trigger an automatic build
2. Run Prisma generation
3. Build the Next.js application
4. Deploy to production

### Deploy Previews
Pull requests automatically create preview deployments at:
```
https://deploy-preview-{PR-NUMBER}--your-site-name.netlify.app
```

## API Endpoints

Your app exposes these endpoints:

- `GET /api/stocks` - Current prices for all ETFs (auto-refresh source)
- `GET /api/stocks/candlestick?symbol={SYMBOL}&months={N}` - Historical data for sparklines
- `GET /api/predictions/batch` - Latest predictions for all symbols
- `POST /api/feedback` - User feedback submission

## Next Steps

### Recommended Enhancements
1. **Add more ETFs** - Extend the STOCKS array in `page.tsx`
2. **Custom alerts** - Email/SMS notifications for price changes
3. **Portfolio tracking** - Let users save watchlists
4. **Mobile app** - Create React Native version
5. **Advanced charts** - Add technical indicators

### Scaling Considerations
- Use Netlify Edge Functions for ultra-low latency
- Implement Redis caching for high-traffic scenarios
- Add database read replicas for global performance
- Enable Netlify Analytics for detailed insights

## Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Netlify](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-netlify)
- [SWR Documentation](https://swr.vercel.app)

## Support

For issues or questions:
1. Check Netlify Deploy logs
2. Review Function logs for API errors
3. Test locally with `npm run dev`
4. Verify environment variables are set correctly

---

**Version:** 1.0.0
**Last Updated:** 2025-12-28
**Framework:** Next.js 15.2.4
**Deployment:** Netlify with Edge Functions
