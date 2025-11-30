import { List, LayoutGrid, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'gallery' | 'table';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onChange: (view: ViewMode) => void;
}

const views: { id: ViewMode; icon: typeof List; label: string }[] = [
  { id: 'list', icon: List, label: 'List' },
  { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
  { id: 'table', icon: Table2, label: 'Table' },
];

export function ViewSwitcher({ currentView, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            onClick={() => onChange(view.id)}
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center transition-all",
              currentView === view.id
                ? "bg-card shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={view.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
