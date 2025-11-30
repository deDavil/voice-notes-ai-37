import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { EmptyState } from '@/components/EmptyState';
import { RecordingModal } from '@/components/RecordingModal';
import { TagFilter } from '@/components/TagFilter';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ViewSwitcher, ViewMode } from '@/components/ViewSwitcher';
import { SearchInput } from '@/components/SearchInput';
import { ConnectionListView } from '@/components/ConnectionListView';
import { ConnectionGalleryView } from '@/components/ConnectionGalleryView';
import { ConnectionTableView } from '@/components/ConnectionTableView';
import { useConnections } from '@/hooks/useConnections';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CategoryType = 'all' | 'professional' | 'personal';

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('connections-view') as ViewMode) || 'list';
  });
  const { data: connections, isLoading } = useConnections();

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    localStorage.setItem('connections-view', view);
  };

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    
    let result = connections;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(connection => 
        connection.name?.toLowerCase().includes(query) ||
        connection.profession_or_role?.toLowerCase().includes(query) ||
        connection.company?.toLowerCase().includes(query) ||
        connection.location?.toLowerCase().includes(query) ||
        connection.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
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
  }, [connections, selectedTags, categoryFilter, searchQuery]);

  const hasActiveFilters = selectedTags.length > 0 || categoryFilter !== 'all' || searchQuery.trim();

  const handleOpenRecording = () => setRecordingOpen(true);
  const handleSuccess = () => {
    // Could navigate to the new connection, but for now just close
  };

  const handleConnectionClick = (id: string) => {
    navigate(`/connection/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddConnection={handleOpenRecording} />
      <Navigation />

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : connections && connections.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <CategoryFilter 
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
              <div className="flex items-center gap-3">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search connections..."
                  className="w-full sm:w-64"
                />
                <ViewSwitcher currentView={viewMode} onChange={handleViewChange} />
              </div>
            </div>
            
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
              <div className="animate-fade-in">
                {viewMode === 'list' && (
                  <ConnectionListView
                    connections={filteredConnections}
                    onConnectionClick={handleConnectionClick}
                    userProfile={profile}
                  />
                )}
                {viewMode === 'gallery' && (
                  <ConnectionGalleryView
                    connections={filteredConnections}
                    onConnectionClick={handleConnectionClick}
                    userProfile={profile}
                  />
                )}
                {viewMode === 'table' && (
                  <ConnectionTableView
                    connections={filteredConnections}
                    onConnectionClick={handleConnectionClick}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No connections match the selected filters.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
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
