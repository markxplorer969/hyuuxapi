import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  categories: string[];
  selected: string | null;
  onSelect: (cat: string) => void;
  counts?: Record<string, any>;
  loading?: boolean;
}

export default function CategorySidebar({ categories, selected, onSelect, counts, loading }: Props) {
  return (
    <div className="sticky top-20">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold mb-3">Categories</h3>

        <div className="space-y-2">
          {loading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-sm text-muted-foreground">No categories found.</div>
          )}

          {!loading && categories.map((cat) => {
            const itemsCount = counts && counts[cat] ? Object.keys(counts[cat]).length : 0;
            return (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition",
                  selected === cat ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                )}
              >
                <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                <span className={cn("text-xs font-medium rounded-full px-2 py-0.5", selected === cat ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700")}>
                  {itemsCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>Tip: use search box to find endpoints quickly.</p>
      </div>
    </div>
  );
}
