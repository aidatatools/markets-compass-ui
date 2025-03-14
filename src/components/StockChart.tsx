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

export default function StockChart({ data, symbol, height = 400, width = 600 }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ 
        width: chartContainerRef.current?.clientWidth || width,
        height: height 
      });
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1E222D' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    // Create candlestick series
    const mainSeries = chart.addCandlestickSeries();
    mainSeries.applyOptions({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      color: '#26a69a',
    });

    // Set the data
    mainSeries.setData(
      data.map(item => ({
        time: (Math.floor(item.timestamp / 1000)) as UTCTimestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))
    );

    volumeSeries.setData(
      data.map(item => ({
        time: (Math.floor(item.timestamp / 1000)) as UTCTimestamp,
        value: item.volume,
        color: item.close > item.open ? '#26a69a' : '#ef5350',
      }))
    );

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
      <div className="absolute top-4 left-4 text-white font-semibold z-10">
        {symbol}
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
} 