export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>
          Copyright © by{' '}
          <a 
            href="https://aidatatools.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            aidatatools
          </a>
          {' '}2025 - 2026
        </p>
      </div>
    </footer>
  );
} 