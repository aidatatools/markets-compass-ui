'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');
      
      setFormData({ name: '', email: '', comment: '' });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md p-6 border border-yellow-100 dark:border-yellow-900/30">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-yellow-50">Share Your Feedback</h2>
      <p className="text-gray-600 dark:text-yellow-200/70 mb-6">
        Help us improve Markets Compass by sharing your thoughts and suggestions.
      </p>
      
      {status === 'success' && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          Thank you for your feedback! We appreciate your input.
        </div>
      )}
      
      {status === 'error' && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          Failed to submit feedback. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-yellow-100/90">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-yellow-200 bg-white dark:bg-yellow-900/30 dark:border-yellow-800/50 shadow-sm focus:border-yellow-300 focus:ring-yellow-200 dark:text-yellow-50"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-yellow-100/90">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-yellow-200 bg-white dark:bg-yellow-900/30 dark:border-yellow-800/50 shadow-sm focus:border-yellow-300 focus:ring-yellow-200 dark:text-yellow-50"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-yellow-100/90">
            Comments or Suggestions
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-yellow-200 bg-white dark:bg-yellow-900/30 dark:border-yellow-800/50 shadow-sm focus:border-yellow-300 focus:ring-yellow-200 dark:text-yellow-50"
            placeholder="Share your thoughts, feature requests, or suggestions..."
          />
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:text-yellow-50"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
} 