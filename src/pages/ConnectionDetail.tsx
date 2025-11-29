import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnection, useUpdateConnection, useDeleteConnection } from '@/hooks/useConnections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Star, 
  Trash2, 
  Save, 
  Loader2, 
  X, 
  Plus,
  Calendar,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const relationshipColors: Record<string, string> = {
  professional: 'bg-tag-professional/15 text-tag-professional border-tag-professional/30',
  personal: 'bg-tag-personal/15 text-tag-personal border-tag-personal/30',
  networking: 'bg-tag-networking/15 text-tag-networking border-tag-networking/30',
  other: 'bg-tag-other/15 text-tag-other border-tag-other/30',
};

export default function ConnectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: connection, isLoading } = useConnection(id);
  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newAction, setNewAction] = useState('');

  const startEditing = () => {
    if (connection) {
      setFormData({
        name: connection.name || '',
        how_we_met: connection.how_we_met || '',
        profession_or_role: connection.profession_or_role || '',
        key_interests: [...connection.key_interests],
        important_facts: [...connection.important_facts],
        relationship_type: connection.relationship_type,
        tags: [...connection.tags],
        follow_up_actions: [...connection.follow_up_actions],
        additional_notes: connection.additional_notes || '',
        is_favorite: connection.is_favorite,
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(null);
  };

  const handleSave = () => {
    if (!id || !formData) return;
    
    updateConnection.mutate(
      {
        id,
        name: formData.name || null,
        how_we_met: formData.how_we_met || null,
        profession_or_role: formData.profession_or_role || null,
        key_interests: formData.key_interests,
        important_facts: formData.important_facts,
        relationship_type: formData.relationship_type,
        tags: formData.tags,
        follow_up_actions: formData.follow_up_actions,
        additional_notes: formData.additional_notes || null,
        is_favorite: formData.is_favorite,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setFormData(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteConnection.mutate(id, {
      onSuccess: () => navigate('/'),
    });
  };

  const toggleFavorite = () => {
    if (!connection || !id) return;
    updateConnection.mutate({ id, is_favorite: !connection.is_favorite });
  };

  // Array manipulation helpers
  const handleAddItem = (field: string, value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter('');
    }
  };

  const handleRemoveItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-48 w-full rounded-xl mb-4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Connection not found</h2>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  const displayData = isEditing ? formData : connection;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                disabled={isEditing}
              >
                <Star 
                  className={cn(
                    "w-5 h-5",
                    connection.is_favorite && "fill-accent text-accent"
                  )} 
                />
              </Button>
              
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button 
                    variant="accent" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={updateConnection.isPending}
                    className="gap-1"
                  >
                    {updateConnection.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Name and basic info */}
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                  placeholder="Person's name"
                  className="text-xl font-semibold"
                />
              </div>
              <div>
                <Label>How We Met</Label>
                <Input
                  value={formData.how_we_met}
                  onChange={(e) => setFormData((p: any) => ({ ...p, how_we_met: e.target.value }))}
                  placeholder="Event, location, or context"
                />
              </div>
              <div>
                <Label>Role / Profession</Label>
                <Input
                  value={formData.profession_or_role}
                  onChange={(e) => setFormData((p: any) => ({ ...p, profession_or_role: e.target.value }))}
                  placeholder="What they do"
                />
              </div>
              <div>
                <Label>Relationship Type</Label>
                <Select
                  value={formData.relationship_type}
                  onValueChange={(v) => setFormData((p: any) => ({ ...p, relationship_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground">
                {connection.name || 'Unknown'}
              </h1>
              {connection.profession_or_role && (
                <p className="text-lg text-muted-foreground">
                  {connection.profession_or_role}
                </p>
              )}
              {connection.how_we_met && (
                <p className="text-muted-foreground">
                  Met at {connection.how_we_met}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Added {format(new Date(connection.created_at), 'MMMM d, yyyy')}
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Tags</Label>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize border",
                relationshipColors[displayData.relationship_type] || relationshipColors.other
              )}
            >
              {displayData.relationship_type}
            </Badge>
            {displayData.tags.map((tag: string, i: number) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {tag}
                {isEditing && (
                  <button onClick={() => handleRemoveItem('tags', i)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('tags', newTag, setNewTag))}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={() => handleAddItem('tags', newTag, setNewTag)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Key Interests */}
        {(displayData.key_interests.length > 0 || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Interests</Label>
            <div className="flex flex-wrap gap-2">
              {displayData.key_interests.map((interest: string, i: number) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {interest}
                  {isEditing && (
                    <button onClick={() => handleRemoveItem('key_interests', i)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add interest"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('key_interests', newInterest, setNewInterest))}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => handleAddItem('key_interests', newInterest, setNewInterest)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Important Facts */}
        {(displayData.important_facts.length > 0 || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Important Facts</Label>
            <div className="space-y-2">
              {displayData.important_facts.map((fact: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-card rounded-lg border">
                  <span className="text-sm flex-1">{fact}</span>
                  {isEditing && (
                    <button onClick={() => handleRemoveItem('important_facts', i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder="Add fact"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('important_facts', newFact, setNewFact))}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => handleAddItem('important_facts', newFact, setNewFact)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Follow-up Actions */}
        {(displayData.follow_up_actions.length > 0 || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Follow-up Actions</Label>
            <div className="space-y-2">
              {displayData.follow_up_actions.map((action: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <span className="text-sm flex-1">{action}</span>
                  {isEditing && (
                    <button onClick={() => handleRemoveItem('follow_up_actions', i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="Add action"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('follow_up_actions', newAction, setNewAction))}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => handleAddItem('follow_up_actions', newAction, setNewAction)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Additional Notes */}
        {(displayData.additional_notes || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Additional Notes</Label>
            {isEditing ? (
              <Textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData((p: any) => ({ ...p, additional_notes: e.target.value }))}
                placeholder="Any other notes..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-foreground bg-card p-3 rounded-lg border">
                {connection.additional_notes}
              </p>
            )}
          </div>
        )}

        {/* Original Transcription */}
        {connection.original_transcription && (
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Original Voice Note
            </Label>
            <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
              "{connection.original_transcription}"
            </p>
          </div>
        )}

        {/* Delete Button */}
        {!isEditing && (
          <div className="pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Connection
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this connection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {connection.name || 'this connection'} and all associated information. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </main>
    </div>
  );
}
