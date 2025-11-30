import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { ConnectionsEmptyState } from '@/components/EmptyState';
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
import { Plus } from 'lucide-react';
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

  const handleConnectionClick = (id: string) => {
    navigate(`/connection/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddConnection={handleOpenRecording} />
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : connections && connections.length > 0 ? (
          <>
            {/* Filters row */}
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
                  className="w-full sm:w-56"
                />
                <ViewSwitcher currentView={viewMode} onChange={handleViewChange} />
              </div>
            </div>
            
            {/* Tags filter */}
            <div className="mb-5">
              <TagFilter 
                connections={connections}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
            
            {/* Results count */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredConnections.length} of {connections.length} connections
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="text-xs h-7"
                >
                  Clear filters
                </Button>
              </div>
            )}
            
            {/* Connections list */}
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
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No connections match your filters</p>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        ) : (
          <ConnectionsEmptyState onAddConnection={handleOpenRecording} />
        )}
      </main>

      {/* Floating action button on mobile */}
      {connections && connections.length > 0 && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <Button
            size="icon-lg"
            className="rounded-full shadow-lg"
            onClick={handleOpenRecording}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}

      <RecordingModal
        open={recordingOpen}
        onOpenChange={setRecordingOpen}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default Index;
