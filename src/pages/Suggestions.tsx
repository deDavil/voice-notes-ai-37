import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSuggestions, useCreateSuggestion, useUpdateSuggestion, useDeleteSuggestion } from '@/hooks/useSuggestions';
import { useConnections } from '@/hooks/useConnections';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, ChevronDown, Trash2, Pencil, Lightbulb, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { SuggestionWithConnection, SuggestionType, suggestionTypeIcons, suggestionTypeLabels } from '@/types/suggestion';

const typeFilters: (SuggestionType | 'all')[] = ['all', 'book', 'podcast', 'article', 'tool', 'course', 'other'];

export default function Suggestions() {
  const { data: suggestions, isLoading } = useSuggestions();
  const { data: connections } = useConnections();
  const createSuggestion = useCreateSuggestion();
  const updateSuggestion = useUpdateSuggestion();
  const deleteSuggestion = useDeleteSuggestion();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<SuggestionType>('book');
  const [newUrl, setNewUrl] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [activeFilter, setActiveFilter] = useState<SuggestionType | 'all'>('all');
  const [editingSuggestion, setEditingSuggestion] = useState<SuggestionWithConnection | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<SuggestionType>('book');
  const [editUrl, setEditUrl] = useState('');

  const filteredSuggestions = suggestions?.filter(s =>
    activeFilter === 'all' || s.type === activeFilter
  ) || [];
  const pendingSuggestions = filteredSuggestions.filter(s => !s.is_completed);
  const completedSuggestions = filteredSuggestions.filter(s => s.is_completed);

  const handleAdd = () => {
    if (!newText.trim() || !selectedConnectionId) return;
    createSuggestion.mutate(
      {
        text: newText.trim(),
        type: newType,
        url: newUrl.trim() || undefined,
        connection_id: selectedConnectionId,
      },
      {
        onSuccess: () => {
          setNewText('');
          setNewType('book');
          setNewUrl('');
          setSelectedConnectionId('');
          setIsAddOpen(false);
        },
      }
    );
  };

  const handleToggle = (suggestion: SuggestionWithConnection) => {
    updateSuggestion.mutate({ id: suggestion.id, is_completed: !suggestion.is_completed });
  };

  const handleDelete = (id: string) => {
    deleteSuggestion.mutate(id);
  };

  const handleEdit = (suggestion: SuggestionWithConnection) => {
    setEditingSuggestion(suggestion);
    setEditText(suggestion.text);
    setEditType(suggestion.type as SuggestionType);
    setEditUrl(suggestion.url || '');
  };

  const handleSaveEdit = () => {
    if (!editingSuggestion || !editText.trim()) return;
    updateSuggestion.mutate(
      { id: editingSuggestion.id, text: editText.trim(), type: editType, url: editUrl.trim() || null },
      { onSuccess: () => setEditingSuggestion(null) }
    );
  };

  const renderSuggestionItem = (suggestion: SuggestionWithConnection) => (
    <div
      key={suggestion.id}
      className={cn(
        "group flex items-start gap-3 p-4 bg-card rounded-lg border transition-colors hover:border-accent/50",
        suggestion.is_completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={suggestion.is_completed}
        onCheckedChange={() => handleToggle(suggestion)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{suggestionTypeIcons[suggestion.type as SuggestionType]}</span>
          <p className={cn("text-sm", suggestion.is_completed && "line-through text-muted-foreground")}>
            {suggestion.text}
          </p>
          {suggestion.url && (
            <a
              href={suggestion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>Recommended by</span>
          <Link
            to={`/connection/${suggestion.connection_id}`}
            className="hover:text-accent transition-colors"
          >
            {suggestion.connection_name || 'Unknown'}
          </Link>
          <span>·</span>
          <span>
            {suggestion.is_completed && suggestion.completed_at
              ? `Completed ${formatDistanceToNow(new Date(suggestion.completed_at), { addSuffix: true })}`
              : `Added ${formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}`}
          </span>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(suggestion)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => handleDelete(suggestion.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onAddConnection={() => {}} />
      <Navigation />

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Suggestions</h2>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Suggestion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Suggestion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Book, podcast, article, tool..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                />
                <Select value={newType} onValueChange={(v) => setNewType(v as SuggestionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(suggestionTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {suggestionTypeIcons[key as SuggestionType]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="URL (optional)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Recommended by" />
                  </SelectTrigger>
                  <SelectContent>
                    {connections?.map((conn) => (
                      <SelectItem key={conn.id} value={conn.id}>
                        {conn.name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAdd}
                  disabled={!newText.trim() || !selectedConnectionId || createSuggestion.isPending}
                  className="w-full"
                >
                  Add Suggestion
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <Badge
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'all' ? 'All' : `${suggestionTypeIcons[filter]} ${suggestionTypeLabels[filter]}`}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : suggestions?.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No suggestions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Book, podcast, and tool recommendations from your
              <br />
              connections will appear here.
            </p>
            <Button variant="accent" onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Suggestion
            </Button>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No {activeFilter !== 'all' ? suggestionTypeLabels[activeFilter].toLowerCase() + 's' : 'suggestions'} found.
          </div>
        ) : (
          <div className="space-y-6">
            {/* To Check Out */}
            {pendingSuggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  To Check Out ({pendingSuggestions.length})
                </h3>
                {pendingSuggestions.map(renderSuggestionItem)}
              </div>
            )}

            {/* Completed */}
            {completedSuggestions.length > 0 && (
              <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <span>Completed ({completedSuggestions.length})</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showCompleted && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {completedSuggestions.map(renderSuggestionItem)}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingSuggestion} onOpenChange={(open) => !open && setEditingSuggestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Suggestion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <Select value={editType} onValueChange={(v) => setEditType(v as SuggestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(suggestionTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {suggestionTypeIcons[key as SuggestionType]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="URL (optional)"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
              <Button onClick={handleSaveEdit} disabled={!editText.trim()} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
