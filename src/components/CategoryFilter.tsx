import { cn } from '@/lib/utils';

type CategoryType = 'all' | 'professional' | 'personal';

interface CategoryFilterProps {
  value: CategoryType;
  onChange: (value: CategoryType) => void;
}

const categories: { value: CategoryType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'professional', label: 'Professional' },
  { value: 'personal', label: 'Personal' },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
            value === category.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
