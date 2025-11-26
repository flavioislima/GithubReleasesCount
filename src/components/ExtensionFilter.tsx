interface ExtensionFilterProps {
  extensions: string[];
  skippedExtensions: Set<string>;
  onToggle: (extension: string) => void;
}

export function ExtensionFilter({ extensions, skippedExtensions, onToggle }: ExtensionFilterProps) {
  return (
    <div className="w-full max-w-xl mx-auto mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Skip File Extensions</h3>
      <div className="flex flex-wrap gap-2">
        {extensions.map((ext) => (
          <label
            key={ext}
            className={`inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
              skippedExtensions.has(ext)
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <input
              type="checkbox"
              checked={skippedExtensions.has(ext)}
              onChange={() => onToggle(ext)}
              className="sr-only"
            />
            <span className="text-sm font-medium">{ext}</span>
            {skippedExtensions.has(ext) && (
              <span className="ml-1 text-xs">(skipped)</span>
            )}
          </label>
        ))}
      </div>
      {extensions.length === 0 && (
        <p className="text-gray-500 text-sm">No extensions found in releases</p>
      )}
    </div>
  );
}
