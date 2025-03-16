'use client';

import React from 'react';

interface PredictionContentProps {
  prediction: {
    _id: string;
    symbolId: string;
    prediction: string;
    confidence: number;
    timestamp: string;
    rawResponse: {
      success: boolean;
      answer: string;
      learnings: string[];
      visitedUrls: string[];
    };
    markdownReport: string;
    htmlReport: string;
  };
}

export default function PredictionContent({ prediction }: PredictionContentProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{prediction.symbolId}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{prediction.prediction}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Confidence: {prediction.confidence}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(prediction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: prediction.htmlReport }} 
        />
      </div>
    </div>
  );
} 