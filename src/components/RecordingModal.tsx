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
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Connection } from '@/types/connection';

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

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSave = (
    data: Omit<Connection, 'id' | 'created_at' | 'updated_at'>, 
    existingId?: string
  ) => {
    if (existingId) {
      updateConnection.mutate(
        { id: existingId, ...data },
        {
          onSuccess: () => {
            handleClose();
            onSuccess();
          },
        }
      );
    } else {
      createConnection.mutate(data, {
        onSuccess: () => {
          handleClose();
          onSuccess();
        },
      });
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'idle':
        return 'Record Voice Note';
      case 'recording':
        return 'Recording...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Review & Save';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Add Connection';
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
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="accent" onClick={reset}>
                Try Again
              </Button>
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
            isSaving={createConnection.isPending || updateConnection.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
