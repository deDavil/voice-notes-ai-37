import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RecordingInterface } from './RecordingInterface';
import { ReviewForm } from './ReviewForm';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useConnections, useCreateConnection, useUpdateConnection } from '@/hooks/useConnections';
import { useCreateTodos } from '@/hooks/useTodos';
import { useCreateSuggestions } from '@/hooks/useSuggestions';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Connection } from '@/types/connection';
import { SuggestionType } from '@/types/suggestion';

interface RecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecordingModal({ open, onOpenChange, onSuccess }: RecordingModalProps) {
  const { 
    state, 
    duration, 
    result, 
    error, 
    startRecording, 
    stopRecording, 
    reset,
    processFile 
  } = useVoiceRecorder();

  const { data: connections = [] } = useConnections();
  const createConnection = useCreateConnection();
  const updateConnection = useUpdateConnection();
  const createTodos = useCreateTodos();
  const createSuggestions = useCreateSuggestions();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSave = async (
    data: Omit<Connection, 'id' | 'created_at' | 'updated_at' | 'user_id'>, 
    existingId?: string,
    todos?: { text: string }[],
    suggestions?: { text: string; type: SuggestionType }[]
  ) => {
    try {
      let connectionId: string;

      if (existingId) {
        const existing = connections.find(c => c.id === existingId);
        if (existing) {
          await updateConnection.mutateAsync({
            id: existingId,
            ...data,
            key_interests: [...new Set([...existing.key_interests, ...data.key_interests])],
            important_facts: [...existing.important_facts, ...data.important_facts],
            tags: [...new Set([...existing.tags, ...data.tags])],
            follow_up_actions: [...existing.follow_up_actions, ...data.follow_up_actions],
          });
        }
        connectionId = existingId;
      } else {
        const newConnection = await createConnection.mutateAsync(data);
        connectionId = newConnection.id;
      }

      if (todos && todos.length > 0) {
        await createTodos.mutateAsync(
          todos.map(t => ({ text: t.text, connection_id: connectionId }))
        );
      }

      if (suggestions && suggestions.length > 0) {
        await createSuggestions.mutateAsync(
          suggestions.map(s => ({ text: s.text, type: s.type, connection_id: connectionId }))
        );
      }

      handleClose();
      onSuccess();
    } catch (err) {
      // Error handled by mutation hooks
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'idle': return 'Record Voice Note';
      case 'recording': return 'Recording...';
      case 'processing': return 'Processing...';
      case 'complete': return 'Review & Save';
      case 'error': return 'Something went wrong';
      default: return 'Add Connection';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {state === 'error' && (
          <div className="flex flex-col items-center py-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button variant="accent" onClick={reset}>Try Again</Button>
            </div>
          </div>
        )}

        {(state === 'idle' || state === 'recording' || state === 'processing') && (
          <RecordingInterface
            state={state}
            duration={duration}
            onStart={startRecording}
            onStop={stopRecording}
            onCancel={handleClose}
            onFileUpload={processFile}
          />
        )}

        {state === 'complete' && result && (
          <ReviewForm
            data={result}
            existingConnections={connections}
            onSave={handleSave}
            onCancel={handleClose}
            isSaving={createConnection.isPending || updateConnection.isPending || createTodos.isPending || createSuggestions.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
