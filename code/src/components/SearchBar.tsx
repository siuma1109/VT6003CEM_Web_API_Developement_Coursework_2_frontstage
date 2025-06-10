import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search hotels...' 
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                 focus:border-primary-dark dark:focus:border-primary-light
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 placeholder-gray-500 dark:placeholder-gray-400
                 transition-colors duration-200"
      />
    </div>
  );
}; 