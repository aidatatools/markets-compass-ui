'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  return (
    <>
      {/* GA4 scripts are disabled to prevent data collection */}
      {/* 
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-6KD7M5EKZL"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Disable data collection by setting consent mode to denied
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
          });
          
          gtag('config', 'G-6KD7M5EKZL', {
            'anonymize_ip': true,
            'restricted_data_processing': true
          });
        `}
      </Script>
      */}
    </>
  );
} 