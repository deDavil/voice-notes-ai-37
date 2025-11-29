import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { ConnectionCard } from '@/components/ConnectionCard';
import { RecordingModal } from '@/components/RecordingModal';
import { useConnections } from '@/hooks/useConnections';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [recordingOpen, setRecordingOpen] = useState(false);
  const { data: connections, isLoading } = useConnections();

  const handleOpenRecording = () => setRecordingOpen(true);
  const handleSuccess = () => {
    // Could navigate to the new connection, but for now just close
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddConnection={handleOpenRecording} />

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : connections && connections.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onClick={() => navigate(`/connection/${connection.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAddConnection={handleOpenRecording} />
        )}
      </main>

      {/* Floating action button on mobile when there are connections */}
      {connections && connections.length > 0 && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <Button
            variant="accent"
            size="icon-lg"
            className="rounded-full shadow-xl"
            onClick={handleOpenRecording}
          >
            <Mic className="w-6 h-6" />
          </Button>
        </div>
      )}

      <RecordingModal
        open={recordingOpen}
        onOpenChange={setRecordingOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Index;
