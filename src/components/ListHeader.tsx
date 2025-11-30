import { ReactNode } from 'react';
import { SearchInput } from '@/components/SearchInput';
import { cn } from '@/lib/utils';

interface ListHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ListHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  className,
}: ListHeaderProps) {
  return (
    <div className={cn("space-y-3 mb-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {onSearchChange && (
          <div className="flex-1 max-w-sm">
            <SearchInput
              value={searchValue || ''}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:ml-auto">
          {filters}
          {actions}
        </div>
      </div>
    </div>
  );
}
