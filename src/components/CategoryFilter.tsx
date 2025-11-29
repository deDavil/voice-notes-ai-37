import { Briefcase, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type CategoryType = 'all' | 'professional' | 'personal';

interface CategoryFilterProps {
  value: CategoryType;
  onChange: (value: CategoryType) => void;
}

const categories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Users className="w-4 h-4" /> },
  { id: 'professional', label: 'Professional', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 mb-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            value === cat.id
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
