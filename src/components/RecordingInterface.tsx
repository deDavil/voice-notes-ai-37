import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingState } from '@/hooks/useVoiceRecorder';
import { cn } from '@/lib/utils';

interface RecordingInterfaceProps {
  state: RecordingState;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RecordingInterface({ 
  state, 
  duration, 
  onStart, 
  onStop, 
  onCancel 
}: RecordingInterfaceProps) {
  if (state === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Processing your voice note
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          Transcribing and extracting information...
        </p>
      </div>
    );
  }

  if (state === 'recording') {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
        {/* Waveform visualization */}
        <div className="flex items-center justify-center gap-1 mb-6 h-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 bg-recording rounded-full",
                i === 0 && "animate-waveform",
                i === 1 && "animate-waveform-delay-1",
                i === 2 && "animate-waveform-delay-2",
                i === 3 && "animate-waveform-delay-3",
                i === 4 && "animate-waveform-delay-4",
              )}
              style={{ height: '24px' }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-4xl font-semibold text-foreground mb-2 tabular-nums">
          {formatTime(duration)}
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Recording... {duration >= 240 ? '(Max 5 min)' : 'Speak clearly'}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            variant="recording"
            size="icon-lg"
            onClick={onStop}
            className="rounded-full"
          >
            <Square className="w-6 h-6 fill-current" />
          </Button>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm">
        Describe someone you met — their name, where you met, what you talked about, 
        and anything interesting about them.
      </p>

      <div className="relative mb-6">
        {/* Ripple effect rings */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ripple" />
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ripple" style={{ animationDelay: '0.5s' }} />
        
        <Button
          variant="hero"
          size="icon-xl"
          onClick={onStart}
          className="rounded-full relative z-10"
        >
          <Mic className="w-8 h-8" />
        </Button>
      </div>

      <p className="text-sm font-medium text-foreground">
        Tap to start recording
      </p>
    </div>
  );
}
