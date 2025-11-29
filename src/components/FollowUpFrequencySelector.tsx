import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { FREQUENCY_OPTIONS, FollowUpFrequency } from '@/types/notification';
import { cn } from '@/lib/utils';

interface FollowUpFrequencySelectorProps {
  value: FollowUpFrequency;
  onChange: (value: FollowUpFrequency) => void;
  suggestedFrequency?: FollowUpFrequency;
  suggestedReason?: string;
}

export function FollowUpFrequencySelector({
  value,
  onChange,
  suggestedFrequency,
  suggestedReason,
}: FollowUpFrequencySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Follow-up Reminders</Label>
      </div>

      {suggestedFrequency && suggestedFrequency !== 'none' && (
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">AI Suggested:</span>
            <Badge variant="secondary" className="capitalize">
              {FREQUENCY_OPTIONS.find(f => f.value === suggestedFrequency)?.label}
            </Badge>
          </div>
          {suggestedReason && (
            <p className="text-muted-foreground text-xs italic">"{suggestedReason}"</p>
          )}
        </div>
      )}

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as FollowUpFrequency)}
        className="space-y-2"
      >
        {FREQUENCY_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
              value === option.value
                ? 'bg-accent/10 border-accent/30'
                : 'bg-background border-border hover:bg-muted/50',
              suggestedFrequency === option.value && value !== option.value && 'border-accent/20'
            )}
            onClick={() => onChange(option.value)}
          >
            <RadioGroupItem value={option.value} id={option.value} />
            <Label
              htmlFor={option.value}
              className="flex-1 cursor-pointer flex items-center gap-2"
            >
              <span>{option.label}</span>
              {suggestedFrequency === option.value && value !== option.value && (
                <Badge variant="outline" className="text-xs">
                  Suggested
                </Badge>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
