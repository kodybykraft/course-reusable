'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

export interface SearchableToolbarProps {
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  extraButtons?: ReactNode;
}

export function SearchableToolbar({
  onSearch,
  searchPlaceholder = 'Search...',
  extraButtons,
}: SearchableToolbarProps) {
  const [value, setValue] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setValue(term);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSearch?.(term);
      }, 300);
    },
    [onSearch],
  );

  return (
    <div className="admin-toolbar">
      <input
        type="text"
        className="admin-search"
        placeholder={searchPlaceholder}
        value={value}
        onChange={handleChange}
      />
      <button type="button" className="admin-filter-btn">
        Filter
      </button>
      <button type="button" className="admin-filter-btn">
        Sort
      </button>
      {extraButtons}
    </div>
  );
}
