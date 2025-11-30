import { useState } from 'react';
import { ProcessedVoiceNote } from '@/hooks/useVoiceRecorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ChevronDown, X, Plus, Save, Loader2 } from 'lucide-react';
import { Connection } from '@/types/connection';
import { SuggestionType, suggestionTypeIcons, suggestionTypeLabels } from '@/types/suggestion';
import { FollowUpFrequency, getSuggestedFrequency, calculateNextFollowUp } from '@/types/notification';
import { FollowUpFrequencySelector } from '@/components/FollowUpFrequencySelector';
import { cn } from '@/lib/utils';

interface ExtractedTodoItem {
  text: string;
  selected: boolean;
}

interface ExtractedSuggestionItem {
  text: string;
  type: SuggestionType;
  selected: boolean;
}

interface ReviewFormProps {
  data: ProcessedVoiceNote;
  existingConnections: Connection[];
  onSave: (
    data: Omit<Connection, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
    existingId?: string,
    todos?: { text: string }[],
    suggestions?: { text: string; type: SuggestionType }[]
  ) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ReviewForm({ 
  data, 
  existingConnections, 
  onSave, 
  onCancel,
  isSaving 
}: ReviewFormProps) {
  const extracted = data.extracted;
  
  const [formData, setFormData] = useState({
    name: extracted?.name || '',
    how_we_met: extracted?.how_we_met || '',
    profession_or_role: extracted?.profession_or_role || '',
    key_interests: extracted?.key_interests || [],
    important_facts: extracted?.important_facts || [],
    relationship_type: extracted?.relationship_type || 'other',
    tags: extracted?.suggested_tags || [],
    follow_up_actions: extracted?.follow_up_actions || [],
    additional_notes: extracted?.additional_context || '',
  });

  // Initialize todos from extracted data
  const [extractedTodos, setExtractedTodos] = useState<ExtractedTodoItem[]>(
    (extracted?.todos || []).map(t => ({ text: t.text, selected: true }))
  );
  const [newTodoText, setNewTodoText] = useState('');

  // Initialize suggestions from extracted data
  const [extractedSuggestions, setExtractedSuggestions] = useState<ExtractedSuggestionItem[]>(
    (extracted?.suggestions || []).map(s => ({ 
      text: s.text, 
      type: s.type as SuggestionType, 
      selected: true 
    }))
  );
  const [newSuggestionText, setNewSuggestionText] = useState('');
  const [newSuggestionType, setNewSuggestionType] = useState<SuggestionType>('book');

  const [newTag, setNewTag] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newAction, setNewAction] = useState('');
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [showTranscription, setShowTranscription] = useState(false);

  // Follow-up frequency state
  const suggestedFrequency = (extracted?.suggested_follow_up_frequency as FollowUpFrequency) || 
    getSuggestedFrequency(formData.relationship_type);
  const [followUpFrequency, setFollowUpFrequency] = useState<FollowUpFrequency>(suggestedFrequency);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.key_interests.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, key_interests: [...prev.key_interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({ ...prev, key_interests: prev.key_interests.filter(i => i !== interest) }));
  };

  const handleAddFact = () => {
    if (newFact.trim()) {
      setFormData(prev => ({ ...prev, important_facts: [...prev.important_facts, newFact.trim()] }));
      setNewFact('');
    }
  };

  const handleRemoveFact = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      important_facts: prev.important_facts.filter((_, i) => i !== index) 
    }));
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setFormData(prev => ({ ...prev, follow_up_actions: [...prev.follow_up_actions, newAction.trim()] }));
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      follow_up_actions: prev.follow_up_actions.filter((_, i) => i !== index) 
    }));
  };

  // Todo handlers
  const handleToggleTodo = (index: number) => {
    setExtractedTodos(prev => 
      prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t)
    );
  };

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      setExtractedTodos(prev => [...prev, { text: newTodoText.trim(), selected: true }]);
      setNewTodoText('');
    }
  };

  const handleRemoveTodo = (index: number) => {
    setExtractedTodos(prev => prev.filter((_, i) => i !== index));
  };

  // Suggestion handlers
  const handleToggleSuggestion = (index: number) => {
    setExtractedSuggestions(prev => 
      prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s)
    );
  };

  const handleAddSuggestion = () => {
    if (newSuggestionText.trim()) {
      setExtractedSuggestions(prev => [...prev, { 
        text: newSuggestionText.trim(), 
        type: newSuggestionType, 
        selected: true 
      }]);
      setNewSuggestionText('');
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setExtractedSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const now = new Date();
    const nextFollowUp = calculateNextFollowUp(followUpFrequency, now);
    
    const connectionData = {
      name: formData.name || null,
      how_we_met: formData.how_we_met || null,
      profession_or_role: formData.profession_or_role || null,
      key_interests: formData.key_interests,
      important_facts: formData.important_facts,
      relationship_type: formData.relationship_type,
      tags: formData.tags,
      follow_up_actions: formData.follow_up_actions,
      additional_notes: formData.additional_notes || null,
      original_transcription: data.transcription,
      is_favorite: false,
      follow_up_frequency: followUpFrequency,
      last_interaction_at: now.toISOString(),
      next_follow_up_at: nextFollowUp?.toISOString() || null,
      follow_up_enabled: followUpFrequency !== 'none',
      // New expanded fields - set to defaults for new connections
      photo_url: null,
      email: null,
      phone: null,
      location: null,
      birthday: null,
      company: null,
      company_website: null,
      linkedin_url: null,
      twitter_url: null,
      instagram_url: null,
      website_url: null,
      introduced_by: null,
      how_i_can_help: null,
      how_they_can_help: null,
      warmth_level: 'neutral' as const,
      priority: 'normal' as const,
    };

    const selectedTodos = extractedTodos.filter(t => t.selected).map(t => ({ text: t.text }));
    const selectedSuggestions = extractedSuggestions.filter(s => s.selected).map(s => ({ 
      text: s.text, 
      type: s.type 
    }));

    if (saveMode === 'existing' && selectedConnectionId) {
      onSave(connectionData, selectedConnectionId, selectedTodos, selectedSuggestions);
    } else {
      onSave(connectionData, undefined, selectedTodos, selectedSuggestions);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Transcription collapsible */}
      <Collapsible open={showTranscription} onOpenChange={setShowTranscription}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between p-3 bg-muted/50 rounded-lg">
          <span>View original transcription</span>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showTranscription && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground italic">
            "{data.transcription}"
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Form fields */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Person's name"
          />
        </div>

        <div>
          <Label htmlFor="how_we_met">How We Met</Label>
          <Input
            id="how_we_met"
            value={formData.how_we_met}
            onChange={(e) => setFormData(prev => ({ ...prev, how_we_met: e.target.value }))}
            placeholder="Event, location, or context"
          />
        </div>

        <div>
          <Label htmlFor="profession">Role / Profession</Label>
          <Input
            id="profession"
            value={formData.profession_or_role}
            onChange={(e) => setFormData(prev => ({ ...prev, profession_or_role: e.target.value }))}
            placeholder="What they do"
          />
        </div>

        <div>
          <Label htmlFor="relationship_type">Relationship Type</Label>
          <Select
            value={formData.relationship_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, relationship_type: value }))}
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

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Key Interests */}
        <div>
          <Label>Key Interests</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.key_interests.map((interest) => (
              <Badge key={interest} variant="outline" className="gap-1">
                {interest}
                <button onClick={() => handleRemoveInterest(interest)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add interest"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleAddInterest}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Important Facts */}
        <div>
          <Label>Important Facts</Label>
          <div className="space-y-2 mb-2">
            {formData.important_facts.map((fact, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className="text-sm flex-1">{fact}</span>
                <button onClick={() => handleRemoveFact(index)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="Add fact"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFact())}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleAddFact}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Follow-up Actions */}
        <div>
          <Label>Follow-up Actions</Label>
          <div className="space-y-2 mb-2">
            {formData.follow_up_actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-accent/10 rounded-md">
                <span className="text-sm flex-1">{action}</span>
                <button onClick={() => handleRemoveAction(index)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Add action item"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAction())}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleAddAction}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.additional_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
            placeholder="Any other information..."
            rows={3}
          />
        </div>
      </div>

      {/* Extracted TO-DOs */}
      {(extractedTodos.length > 0 || newTodoText) && (
        <div className="border-t pt-4 space-y-3">
          <Label className="flex items-center gap-2">
            ✅ Action Items Detected ({extractedTodos.filter(t => t.selected).length})
          </Label>
          <div className="space-y-2">
            {extractedTodos.map((todo, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-md">
                <Checkbox 
                  checked={todo.selected} 
                  onCheckedChange={() => handleToggleTodo(index)}
                />
                <span className={cn("text-sm flex-1", !todo.selected && "text-muted-foreground line-through")}>
                  {todo.text}
                </span>
                <button onClick={() => handleRemoveTodo(index)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add another action item"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTodo())}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleAddTodo}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Extracted Suggestions */}
      {(extractedSuggestions.length > 0 || newSuggestionText) && (
        <div className="border-t pt-4 space-y-3">
          <Label className="flex items-center gap-2">
            💡 Suggestions Detected ({extractedSuggestions.filter(s => s.selected).length})
          </Label>
          <div className="space-y-2">
            {extractedSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-md">
                <Checkbox 
                  checked={suggestion.selected} 
                  onCheckedChange={() => handleToggleSuggestion(index)}
                />
                <span className="text-base">{suggestionTypeIcons[suggestion.type]}</span>
                <span className={cn("text-sm flex-1", !suggestion.selected && "text-muted-foreground line-through")}>
                  {suggestion.text}
                </span>
                <button onClick={() => handleRemoveSuggestion(index)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSuggestionText}
              onChange={(e) => setNewSuggestionText(e.target.value)}
              placeholder="Add another suggestion"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSuggestion())}
              className="flex-1"
            />
            <Select value={newSuggestionType} onValueChange={(v) => setNewSuggestionType(v as SuggestionType)}>
              <SelectTrigger className="w-32">
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
            <Button type="button" variant="outline" size="icon" onClick={handleAddSuggestion}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Follow-up Frequency */}
      <div className="border-t pt-4">
        <FollowUpFrequencySelector
          value={followUpFrequency}
          onChange={setFollowUpFrequency}
          suggestedFrequency={suggestedFrequency}
          suggestedReason={extracted?.frequency_reasoning}
        />
      </div>

      {/* Save mode selection */}
      {existingConnections.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <Label>Save as</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={saveMode === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSaveMode('new')}
            >
              New Connection
            </Button>
            <Button
              type="button"
              variant={saveMode === 'existing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSaveMode('existing')}
            >
              Update Existing
            </Button>
          </div>
          
          {saveMode === 'existing' && (
            <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {existingConnections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id}>
                    {conn.name || 'Unknown'} - {conn.how_we_met || conn.profession_or_role || 'No details'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Discard
        </Button>
        <Button 
          variant="accent" 
          onClick={handleSubmit} 
          disabled={isSaving || (saveMode === 'existing' && !selectedConnectionId)}
          className="flex-1 gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Connection
        </Button>
      </div>
    </div>
  );
}
