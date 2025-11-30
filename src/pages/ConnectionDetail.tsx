import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useConnection, useUpdateConnection, useDeleteConnection } from '@/hooks/useConnections';
import { useTodosByConnection, useUpdateTodo } from '@/hooks/useTodos';
import { useSuggestionsByConnection, useUpdateSuggestion } from '@/hooks/useSuggestions';
import { useLogInteraction } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
  FileText,
  ChevronRight,
  ChevronDown,
  Bell,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Cake,
  Building2,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { suggestionTypeIcons, SuggestionType } from '@/types/suggestion';
import { FREQUENCY_OPTIONS, FREQUENCY_LABELS, FollowUpFrequency, calculateNextFollowUp } from '@/types/notification';
import { WarmthLevel, PriorityLevel, WARMTH_OPTIONS, PRIORITY_OPTIONS } from '@/types/connection';
import { PhotoUpload } from '@/components/PhotoUpload';
import { SocialLinks } from '@/components/SocialLinks';
import { WarmthBadge } from '@/components/WarmthBadge';
import { PriorityBadge } from '@/components/PriorityBadge';

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
  const { data: todos } = useTodosByConnection(id);
  const { data: suggestions } = useSuggestionsByConnection(id);
  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();
  const updateTodo = useUpdateTodo();
  const updateSuggestion = useUpdateSuggestion();
  const logInteraction = useLogInteraction();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [newFact, setNewFact] = useState('');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const startEditing = () => {
    if (connection) {
      setFormData({
        name: connection.name || '',
        how_we_met: connection.how_we_met || '',
        profession_or_role: connection.profession_or_role || '',
        important_facts: [...(connection.important_facts || [])],
        relationship_type: connection.relationship_type,
        tags: [...(connection.tags || [])],
        
        additional_notes: connection.additional_notes || '',
        is_favorite: connection.is_favorite,
        follow_up_frequency: connection.follow_up_frequency || 'monthly',
        follow_up_enabled: connection.follow_up_enabled ?? true,
        // New fields
        photo_url: connection.photo_url || '',
        email: connection.email || '',
        phone: connection.phone || '',
        location: connection.location || '',
        birthday: connection.birthday || '',
        company: connection.company || '',
        company_website: connection.company_website || '',
        linkedin_url: connection.linkedin_url || '',
        twitter_url: connection.twitter_url || '',
        instagram_url: connection.instagram_url || '',
        website_url: connection.website_url || '',
        introduced_by: connection.introduced_by || '',
        how_i_can_help: connection.how_i_can_help || '',
        how_they_can_help: connection.how_they_can_help || '',
        warmth_level: connection.warmth_level || 'neutral',
        priority: connection.priority || 'normal',
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
    
    const nextFollowUp = formData.follow_up_enabled && formData.follow_up_frequency !== 'none'
      ? calculateNextFollowUp(formData.follow_up_frequency as FollowUpFrequency)
      : null;
    
    updateConnection.mutate(
      {
        id,
        name: formData.name || null,
        how_we_met: formData.how_we_met || null,
        profession_or_role: formData.profession_or_role || null,
        important_facts: formData.important_facts,
        relationship_type: formData.relationship_type,
        tags: formData.tags,
        
        additional_notes: formData.additional_notes || null,
        is_favorite: formData.is_favorite,
        follow_up_frequency: formData.follow_up_frequency,
        follow_up_enabled: formData.follow_up_enabled,
        next_follow_up_at: nextFollowUp?.toISOString() || null,
        // New fields
        photo_url: formData.photo_url || null,
        email: formData.email || null,
        phone: formData.phone || null,
        location: formData.location || null,
        birthday: formData.birthday || null,
        company: formData.company || null,
        company_website: formData.company_website || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
        instagram_url: formData.instagram_url || null,
        website_url: formData.website_url || null,
        introduced_by: formData.introduced_by || null,
        how_i_can_help: formData.how_i_can_help || null,
        how_they_can_help: formData.how_they_can_help || null,
        warmth_level: formData.warmth_level,
        priority: formData.priority,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setFormData(null);
        },
      }
    );
  };

  const handleLogInteraction = () => {
    if (!id) return;
    logInteraction.mutate(id);
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

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

  const handleToggleTodo = (todoId: string, isCompleted: boolean) => {
    updateTodo.mutate({ id: todoId, is_completed: !isCompleted });
  };

  const handleToggleSuggestion = (suggestionId: string, isCompleted: boolean) => {
    updateSuggestion.mutate({ id: suggestionId, is_completed: !isCompleted });
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
        {/* Profile Header */}
        <div className="flex gap-6">
          {isEditing ? (
            <PhotoUpload
              currentUrl={formData.photo_url}
              onUpload={(url) => setFormData((p: any) => ({ ...p, photo_url: url }))}
              name={formData.name}
            />
          ) : (
            <PhotoUpload
              currentUrl={connection.photo_url}
              name={connection.name}
              disabled
            />
          )}
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                placeholder="Person's name"
                className="text-2xl font-bold mb-2"
              />
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {connection.name || 'Unknown'}
                </h1>
                <PriorityBadge level={connection.priority} />
              </div>
            )}
            
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={formData.profession_or_role}
                  onChange={(e) => setFormData((p: any) => ({ ...p, profession_or_role: e.target.value }))}
                  placeholder="Role / Title"
                />
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData((p: any) => ({ ...p, company: e.target.value }))}
                  placeholder="Company"
                />
              </div>
            ) : (
              <p className="text-muted-foreground">
                {connection.profession_or_role}
                {connection.company && ` at ${connection.company}`}
              </p>
            )}
            
            {!isEditing && connection.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {connection.location}
              </p>
            )}
            
            {!isEditing && (
              <div className="flex items-center gap-2 mt-2">
                <WarmthBadge level={connection.warmth_level} />
                {connection.introduced_by && (
                  <span className="text-xs text-muted-foreground">
                    Via: {connection.introduced_by}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info (View Mode) */}
        {!isEditing && (connection.email || connection.phone || connection.birthday) && (
          <div className="p-4 bg-card rounded-xl border space-y-2">
            {connection.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${connection.email}`} className="text-foreground hover:text-primary">
                    {connection.email}
                  </a>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(connection.email!, 'email')}>
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
            {connection.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${connection.phone}`} className="text-foreground hover:text-primary">
                    {connection.phone}
                  </a>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(connection.phone!, 'phone')}>
                  {copiedField === 'phone' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
            {connection.birthday && (
              <div className="flex items-center gap-2 text-sm">
                <Cake className="w-4 h-4 text-muted-foreground" />
                <span>{format(new Date(connection.birthday), 'MMMM d')}</span>
              </div>
            )}
          </div>
        )}

        {/* Social Links (View Mode) */}
        {!isEditing && (
          <SocialLinks
            linkedin={connection.linkedin_url}
            twitter={connection.twitter_url}
            instagram={connection.instagram_url}
            website={connection.website_url}
          />
        )}

        {/* Contact & Social Edit Section */}
        {isEditing && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
            <h3 className="text-sm font-semibold text-muted-foreground">Contact & Social</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={formData.email}
                onChange={(e) => setFormData((p: any) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                type="email"
              />
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((p: any) => ({ ...p, phone: e.target.value }))}
                placeholder="Phone"
                type="tel"
              />
              <Input
                value={formData.location}
                onChange={(e) => setFormData((p: any) => ({ ...p, location: e.target.value }))}
                placeholder="City, Country"
              />
              <Input
                value={formData.birthday}
                onChange={(e) => setFormData((p: any) => ({ ...p, birthday: e.target.value }))}
                placeholder="Birthday"
                type="date"
              />
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData((p: any) => ({ ...p, linkedin_url: e.target.value }))}
                placeholder="LinkedIn URL"
              />
              <Input
                value={formData.twitter_url}
                onChange={(e) => setFormData((p: any) => ({ ...p, twitter_url: e.target.value }))}
                placeholder="Twitter URL"
              />
              <Input
                value={formData.instagram_url}
                onChange={(e) => setFormData((p: any) => ({ ...p, instagram_url: e.target.value }))}
                placeholder="Instagram URL"
              />
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData((p: any) => ({ ...p, website_url: e.target.value }))}
                placeholder="Personal Website"
              />
            </div>
          </div>
        )}

        {/* Follow-up Reminders */}
        {!isEditing && connection.follow_up_frequency !== 'none' && connection.follow_up_enabled && (
          <div className="p-4 bg-card rounded-xl border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" />
                <span className="font-medium">Follow-up</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {FREQUENCY_LABELS[connection.follow_up_frequency as FollowUpFrequency] || 'Monthly'}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              {connection.last_interaction_at && (
                <p>Last interaction: {formatDistanceToNow(new Date(connection.last_interaction_at), { addSuffix: true })}</p>
              )}
              {connection.next_follow_up_at && (
                <p>
                  Next reminder: {new Date(connection.next_follow_up_at) > new Date() 
                    ? formatDistanceToNow(new Date(connection.next_follow_up_at), { addSuffix: true })
                    : 'Due now'}
                </p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogInteraction}
              disabled={logInteraction.isPending}
              className="w-full gap-2"
            >
              {logInteraction.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              Log Interaction
            </Button>
          </div>
        )}

        {/* Follow-up & Relationship Settings (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
            <h3 className="text-sm font-semibold text-muted-foreground">Relationship Settings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Relationship Type</Label>
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
              <div>
                <Label className="text-xs">Introduced By</Label>
                <Input
                  value={formData.introduced_by}
                  onChange={(e) => setFormData((p: any) => ({ ...p, introduced_by: e.target.value }))}
                  placeholder="Who connected you?"
                />
              </div>
              <div>
                <Label className="text-xs">Warmth Level</Label>
                <Select
                  value={formData.warmth_level}
                  onValueChange={(v) => setFormData((p: any) => ({ ...p, warmth_level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WARMTH_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.emoji} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData((p: any) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {'emoji' in opt && opt.emoji} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center gap-4 mb-2">
                <Checkbox
                  id="follow_up_enabled"
                  checked={formData?.follow_up_enabled}
                  onCheckedChange={(checked) => setFormData((p: any) => ({ ...p, follow_up_enabled: !!checked }))}
                />
                <label htmlFor="follow_up_enabled" className="text-sm">
                  Enable follow-up reminders
                </label>
              </div>
              {formData?.follow_up_enabled && (
                <Select
                  value={formData?.follow_up_frequency || 'monthly'}
                  onValueChange={(v) => setFormData((p: any) => ({ ...p, follow_up_frequency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.filter(f => f.value !== 'none').map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}

        {/* How We Met */}
        {(displayData.how_we_met || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">How We Met</Label>
            {isEditing ? (
              <Input
                value={formData.how_we_met}
                onChange={(e) => setFormData((p: any) => ({ ...p, how_we_met: e.target.value }))}
                placeholder="Event, location, or context"
              />
            ) : (
              <p className="text-sm text-foreground bg-card p-3 rounded-lg border">
                {connection.how_we_met}
              </p>
            )}
          </div>
        )}

        {/* Value Exchange */}
        {(displayData.how_i_can_help || displayData.how_they_can_help || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Value Exchange</Label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">How I Can Help</Label>
                  <Textarea
                    value={formData.how_i_can_help}
                    onChange={(e) => setFormData((p: any) => ({ ...p, how_i_can_help: e.target.value }))}
                    placeholder="What value can you provide?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">How They Can Help</Label>
                  <Textarea
                    value={formData.how_they_can_help}
                    onChange={(e) => setFormData((p: any) => ({ ...p, how_they_can_help: e.target.value }))}
                    placeholder="What can they offer you?"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {connection.how_i_can_help && (
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">How I Can Help</p>
                    <p className="text-sm">{connection.how_i_can_help}</p>
                  </div>
                )}
                {connection.how_they_can_help && (
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">How They Can Help</p>
                    <p className="text-sm">{connection.how_they_can_help}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
            {displayData.tags?.map((tag: string, i: number) => (
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

        {/* Important Facts */}
        {(displayData.important_facts?.length > 0 || isEditing) && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Important Facts</Label>
            <div className="space-y-2">
              {displayData.important_facts?.map((fact: string, i: number) => (
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


        {/* TO-DOs with this connection */}
        {!isEditing && todos && todos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">TO-DOs with {connection.name || 'this person'}</Label>
              <Link to="/todos" className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                View all TO-DOs <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {todos.slice(0, 3).map((todo) => (
                <div key={todo.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                  <Checkbox 
                    checked={todo.is_completed}
                    onCheckedChange={() => handleToggleTodo(todo.id, todo.is_completed)}
                  />
                  <span className={cn("text-sm flex-1", todo.is_completed && "line-through text-muted-foreground")}>
                    {todo.text}
                  </span>
                </div>
              ))}
              {todos.length > 3 && (
                <Link to="/todos" className="block text-sm text-muted-foreground hover:text-accent text-center py-2">
                  +{todos.length - 3} more
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Suggestions from this connection */}
        {!isEditing && suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Suggestions from {connection.name || 'this person'}</Label>
              <Link to="/suggestions" className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                View all Suggestions <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                  <Checkbox 
                    checked={suggestion.is_completed}
                    onCheckedChange={() => handleToggleSuggestion(suggestion.id, suggestion.is_completed)}
                  />
                  <span className="text-base">{suggestionTypeIcons[suggestion.type as SuggestionType]}</span>
                  <span className={cn("text-sm flex-1", suggestion.is_completed && "line-through text-muted-foreground")}>
                    {suggestion.text}
                  </span>
                </div>
              ))}
              {suggestions.length > 3 && (
                <Link to="/suggestions" className="block text-sm text-muted-foreground hover:text-accent text-center py-2">
                  +{suggestions.length - 3} more
                </Link>
              )}
            </div>
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

        {/* Original Transcription - Collapsible */}
        {connection.original_transcription && (
          <div className="space-y-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {showTranscript ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FileText className="w-4 h-4" />
              <span>Original Voice Note</span>
            </button>
            {showTranscript && (
              <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg animate-fade-in">
                "{connection.original_transcription}"
              </p>
            )}
          </div>
        )}

        {/* Date Added */}
        {!isEditing && (
          <div className="flex items-center text-sm text-muted-foreground pt-4 border-t">
            <Calendar className="w-4 h-4 mr-2" />
            Added {format(new Date(connection.created_at), 'MMMM d, yyyy')}
          </div>
        )}

        {/* Delete Button */}
        {!isEditing && (
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Connection
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {connection.name || 'this connection'}? 
                    This action cannot be undone. All associated TO-DOs and suggestions will also be deleted.
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
