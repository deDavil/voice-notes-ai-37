import { cn } from '@/lib/utils';
import { WarmthLevel } from '@/types/connection';

interface WarmthBadgeProps {
  level: WarmthLevel;
  size?: 'sm' | 'default';
}

const warmthConfig: Record<WarmthLevel, { emoji: string; label: string; color: string }> = {
  cold: { emoji: '🧊', label: 'Cold', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'bg-muted text-muted-foreground' },
  warm: { emoji: '🔥', label: 'Warm', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  hot: { emoji: '⚡', label: 'Hot', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export function WarmthBadge({ level, size = 'default' }: WarmthBadgeProps) {
  const config = warmthConfig[level] || warmthConfig.neutral;
  
  // Don't show badge for neutral
  if (level === 'neutral') return null;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.color,
        size === 'sm' ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs"
      )}
    >
      <span>{config.emoji}</span>
      <span className={size === 'sm' ? 'sr-only sm:not-sr-only' : ''}>{config.label}</span>
    </span>
  );
}
