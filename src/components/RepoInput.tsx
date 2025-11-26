import { useState, type FormEvent } from 'react';

interface RepoInputProps {
  onSubmit: (owner: string, repo: string) => void;
  isLoading: boolean;
}

const DEFAULT_REPO = 'Heroic-Games-Launcher/HeroicGamesLauncher';

export function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [value, setValue] = useState(DEFAULT_REPO);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = value.trim();
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    
    if (!match) {
      setError('Please enter a valid format: owner/repo (e.g., facebook/react)');
      return;
    }

    const [, owner, repo] = match;
    onSubmit(owner, repo);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-8">
      <label htmlFor="repo-input" className="block text-sm font-medium text-gray-700 mb-2">
        GitHub Repository (owner/repo)
      </label>
      <div className="flex gap-2">
        <input
          id="repo-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., facebook/react"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Fetch'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
