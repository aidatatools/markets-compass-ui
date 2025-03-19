'use client';

import { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, LineWidth } from 'lightweight-charts';

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
}

export default function StockChart({ data, symbol, height = 400 }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Memoize the chart options to prevent unnecessary re-renders
  const chartOptions = useMemo(() => ({
    layout: {
      background: { color: '#1E222D' },
      textColor: '#D9D9D9',
    },
    grid: {
      vertLines: { color: '#2B2B43' },
      horzLines: { color: '#2B2B43' },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        labelVisible: true,
        style: 1,
        width: 1 as LineWidth,
        color: '#6A6A6A',
      },
      horzLine: {
        labelVisible: true,
        style: 1,
        width: 1 as LineWidth,
        color: '#6A6A6A',
      },
    },
    rightPriceScale: {
      borderColor: '#2B2B43',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderColor: '#2B2B43',
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
      minBarSpacing: 10,
      rightOffset: 12,
      barSpacing: 12,
      rightBarStaysOnScroll: true,
      borderVisible: false,
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      },
    },
    localization: {
      timeFormatter: (time: number) => {
        const date = new Date(time * 1000);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      },
    },
  }), []);

  // Format data for the chart library
  const formattedData = useMemo(() => {
    return data.map(item => ({
      time: Math.floor(item.timestamp / 1000) as any, // Convert to seconds and cast to any to satisfy the type
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
  }, [data]);

  // Effect for creating/recreating chart when data or symbol changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart first
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
    }

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height,
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Store references
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Set data
    if (formattedData.length > 0) {
      console.log(`Creating chart for ${symbol} with ${formattedData.length} data points`);
      candlestickSeries.setData(formattedData);
    }

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, [chartOptions, height, formattedData, symbol]);

  return (
    <div ref={chartContainerRef} className="w-full" />
  );
} 