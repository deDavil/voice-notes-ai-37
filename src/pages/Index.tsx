import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { EmptyState } from '@/components/EmptyState';
import { ConnectionCard } from '@/components/ConnectionCard';
import { RecordingModal } from '@/components/RecordingModal';
import { TagFilter } from '@/components/TagFilter';
import { CategoryFilter } from '@/components/CategoryFilter';
import { useConnections } from '@/hooks/useConnections';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CategoryType = 'all' | 'professional' | 'personal';

const Index = () => {
  const navigate = useNavigate();
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const { data: connections, isLoading } = useConnections();

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    
    let result = connections;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(connection => 
        connection.relationship_type === categoryFilter
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(connection => 
        selectedTags.every(tag => connection.tags?.includes(tag))
      );
    }
    
    return result;
  }, [connections, selectedTags, categoryFilter]);

  const hasActiveFilters = selectedTags.length > 0 || categoryFilter !== 'all';

  const handleOpenRecording = () => setRecordingOpen(true);
  const handleSuccess = () => {
    // Could navigate to the new connection, but for now just close
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddConnection={handleOpenRecording} />
      <Navigation />

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : connections && connections.length > 0 ? (
          <>
            <CategoryFilter 
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            
            <TagFilter 
              connections={connections}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
            
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredConnections.length} of {connections.length} connections
              </p>
            )}
            
            {filteredConnections.length > 0 ? (
              <div className="space-y-4 animate-fade-in">
                {filteredConnections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onClick={() => navigate(`/connection/${connection.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No connections match the selected filters.</p>
                <Button 
                  variant="link" 
                  onClick={() => setSelectedTags([])}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
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
