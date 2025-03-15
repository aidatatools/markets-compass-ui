'use client';

import { useEffect, useRef } from 'react';
import { createChart, UTCTimestamp } from 'lightweight-charts';

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: CandlestickData[];
  symbol: string;
  height?: number;
  width?: number;
}

export default function StockChart({ data, symbol, height = 600, width = 600 }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const handleResize = () => {
      chart.applyOptions({ 
        width: chartContainerRef.current?.clientWidth || width,
        height: height 
      });
    };

    // Create chart with improved styling
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1E222D' },
        textColor: '#DDD',
        fontSize: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
      },
      grid: {
        vertLines: { color: '#2B2B43', style: 1, visible: true },
        horzLines: { color: '#2B2B43', style: 1, visible: true },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6A6A6A',
          width: 1,
          style: 1,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: '#6A6A6A',
          width: 1,
          style: 1,
          visible: true,
          labelVisible: true,
        },
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        },
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        },
      },
    });

    // Create candlestick series with improved styling
    const mainSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceScaleId: 'right',
      scaleMargins: {
        top: 0.1,
        bottom: 0.3, // Leave space for volume pane
      },
    });

    // Create volume series in a separate pane
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume', // Separate scale
      scaleMargins: {
        top: 0.8, // Position at bottom 20% of chart
        bottom: 0.02,
      },
    });

    // Apply custom styling to volume series
    volumeSeries.applyOptions({
      color: '#26a69a',
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Set the data with proper validation
    const validData = data.filter(item => 
      item && 
      typeof item.timestamp === 'number' && 
      typeof item.open === 'number' && 
      typeof item.high === 'number' && 
      typeof item.low === 'number' && 
      typeof item.close === 'number' && 
      typeof item.volume === 'number'
    );

    if (validData.length > 0) {
      // Format timestamp to ensure it's a proper UTC timestamp without time component
      const formattedData = validData.map(item => {
        // Convert to milliseconds if needed
        const timestamp = item.timestamp > 10000000000 ? item.timestamp : item.timestamp * 1000;
        
        // Create date object and strip time component
        const date = new Date(timestamp);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const utcTimestamp = new Date(dateString).getTime() / 1000;
        
        return {
          ...item,
          formattedTimestamp: utcTimestamp as UTCTimestamp
        };
      });
      
      // Set candlestick data
      mainSeries.setData(
        formattedData.map(item => ({
          time: item.formattedTimestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }))
      );

      // Set volume data with color based on price movement
      volumeSeries.setData(
        formattedData.map(item => ({
          time: item.formattedTimestamp,
          value: item.volume,
          color: item.close >= item.open ? '#26a69a80' : '#ef535080', // Semi-transparent colors
        }))
      );
    }

    // Make chart responsive
    window.addEventListener('resize', handleResize);

    // Fit the chart content
    chart.timeScale().fitContent();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height, width]);

  return (
    <div className="relative w-full">
      <div ref={chartContainerRef} className="w-full h-[600px]" />
    </div>
  );
} 