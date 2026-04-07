'use client';

import { useState, useCallback } from 'react';

export interface TabItem {
  label: string;
  value: string;
  count?: number;
}

export interface InteractiveTabsProps {
  items: TabItem[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function InteractiveTabs({ items, defaultValue, onChange }: InteractiveTabsProps) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value ?? '');

  const handleClick = useCallback(
    (value: string) => {
      setActive(value);
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <div className="admin-tabs">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`admin-tab${active === item.value ? ' admin-tab--active' : ''}`}
          onClick={() => handleClick(item.value)}
        >
          {item.label}
          {item.count !== undefined && <span className="admin-tab-count">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
