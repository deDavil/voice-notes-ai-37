import { cn } from '@/lib/utils';
import { PriorityLevel } from '@/types/connection';

interface PriorityBadgeProps {
  level: PriorityLevel;
  size?: 'sm' | 'default';
}

const priorityConfig: Record<PriorityLevel, { label: string; color: string } | null> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  normal: null, // Don't show badge for normal
  high: { label: 'High', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  vip: { label: '⭐ VIP', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export function PriorityBadge({ level, size = 'default' }: PriorityBadgeProps) {
  const config = priorityConfig[level];
  
  // Don't show badge for normal priority
  if (!config) return null;
  
  // Also hide "low" by default to reduce visual noise
  if (level === 'low') return null;
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.color,
        size === 'sm' ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs"
      )}
    >
      {config.label}
    </span>
  );
}
