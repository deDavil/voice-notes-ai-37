import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

async function processAudioData(base64Audio: string): Promise<ProcessedVoiceNote> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-voice-note`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ audio: base64Audio }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Processing failed');
  }

  return {
    transcription: data.transcription,
    extracted: data.extracted,
  };
}

export type RecordingState = 'idle' | 'recording' | 'processing' | 'complete' | 'error';

export interface ExtractedTodoFromVoice {
  text: string;
  context?: string;
}

export interface ExtractedSuggestionFromVoice {
  text: string;
  type: 'book' | 'podcast' | 'article' | 'tool' | 'course' | 'other';
  context?: string;
}

export interface ProcessedVoiceNote {
  transcription: string;
  extracted: {
    name: string | null;
    how_we_met: string | null;
    profession_or_role: string | null;
    key_interests: string[];
    important_facts: string[];
    relationship_type: string;
    suggested_tags: string[];
    follow_up_actions: string[];
    additional_context: string | null;
    todos?: ExtractedTodoFromVoice[];
    suggestions?: ExtractedSuggestionFromVoice[];
  } | null;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<ProcessedVoiceNote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setState('recording');
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          // Warning at 4 minutes
          if (newDuration === 240) {
            toast.warning('Recording will stop in 1 minute');
          }
          // Stop at 5 minutes
          if (newDuration >= 300) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied. Please allow microphone access and try again.');
      setState('error');
      toast.error('Could not access microphone');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || state !== 'recording') return;

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState('processing');

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-voice-note`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ audio: base64Audio }),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Processing failed');
            }

            setResult({
              transcription: data.transcription,
              extracted: data.extracted,
            });
            setState('complete');
            toast.success('Voice note processed successfully');

          } catch (err: any) {
            console.error('Error processing voice note:', err);
            setError(err.message || 'Failed to process voice note');
            setState('error');
            toast.error(err.message || 'Failed to process voice note');
          }
          
          resolve();
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current!.stop();
    });
  }, [state]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setState('idle');
    setDuration(0);
    setResult(null);
    setError(null);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setState('processing');

    try {
      // Convert file to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const processed = await processAudioData(base64Audio);
          setResult(processed);
          setState('complete');
          toast.success('Audio file processed successfully');
        } catch (err: any) {
          console.error('Error processing audio file:', err);
          setError(err.message || 'Failed to process audio file');
          setState('error');
          toast.error(err.message || 'Failed to process audio file');
        }
      };

      reader.onerror = () => {
        setError('Failed to read audio file');
        setState('error');
        toast.error('Failed to read audio file');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file');
      setState('error');
      toast.error(err.message || 'Failed to process file');
    }
  }, []);

  return {
    state,
    duration,
    result,
    error,
    startRecording,
    stopRecording,
    reset,
    processFile,
  };
}
