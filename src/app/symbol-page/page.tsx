import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Page | Markets Compass',
};

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Page</h1>
        <p>This is a test page to check if the build works.</p>
      </div>
    </div>
  );
}
