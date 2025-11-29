import { useState, useEffect } from 'react';
import { ProcessedVoiceNote } from '@/hooks/useVoiceRecorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  data: ProcessedVoiceNote;
  existingConnections: Connection[];
  onSave: (data: Omit<Connection, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => void;
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

  const [newTag, setNewTag] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newAction, setNewAction] = useState('');
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [showTranscription, setShowTranscription] = useState(false);

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

  const handleSubmit = () => {
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
    };

    if (saveMode === 'existing' && selectedConnectionId) {
      onSave(connectionData, selectedConnectionId);
    } else {
      onSave(connectionData);
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
