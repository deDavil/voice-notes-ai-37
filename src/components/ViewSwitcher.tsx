import { cn } from '@/lib/utils';
import { List, LayoutGrid, Table2 } from 'lucide-react';

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
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            onClick={() => onChange(view.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
              currentView === view.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={view.label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
