import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Loader2, 
  Save, 
  LogOut, 
  Trash2, 
  Pencil, 
  User, 
  Briefcase, 
  MapPin, 
  Link as LinkIcon,
  Sparkles 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TagInput } from '@/components/TagInput';

// Predefined suggestions
const INTEREST_SUGGESTIONS = [
  'travel', 'cooking', 'hiking', 'photography', 'music', 'sports', 
  'reading', 'gaming', 'fitness', 'art', 'podcasts', 'movies', 
  'gardening', 'yoga', 'coffee', 'wine', 'sailing', 'cycling'
];

const INDUSTRY_SUGGESTIONS = [
  'tech', 'finance', 'healthcare', 'creative', 'education', 'legal', 
  'marketing', 'sales', 'product', 'engineering', 'design', 'consulting', 
  'startups', 'real estate', 'media', 'hospitality'
];

const TOPIC_SUGGESTIONS = [
  'AI', 'remote work', 'productivity', 'leadership', 'investing', 
  'sustainability', 'design', 'growth', 'crypto', 'health', 
  'parenting', 'entrepreneurship', 'climate', 'web3', 'data'
];

export default function Settings() {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Basic info
  const [fullName, setFullName] = useState('');
  const [professionOrRole, setProfessionOrRole] = useState('');
  const [company, setCompany] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  
  // Social links
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // Interests & Tags
  const [interests, setInterests] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  
  // Preferences
  const [defaultFollowUpFrequency, setDefaultFollowUpFrequency] = useState('monthly');
  const [defaultView, setDefaultView] = useState('list');
  const [showFollowUpReminders, setShowFollowUpReminders] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setProfessionOrRole(profile.profession_or_role || '');
      setCompany(profile.company || '');
      setCompanyWebsite(profile.company_website || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setTwitterUrl(profile.twitter_url || '');
      setWebsiteUrl(profile.website_url || '');
      setInterests(profile.interests || []);
      setIndustries(profile.industries || []);
      setTopics(profile.topics || []);
      setDefaultFollowUpFrequency(profile.default_follow_up_frequency || 'monthly');
      setDefaultView(profile.default_view || 'list');
      setShowFollowUpReminders(profile.show_follow_up_reminders ?? true);
      setEmailNotifications(profile.email_notifications ?? false);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      profession_or_role: professionOrRole || null,
      company: company || null,
      company_website: companyWebsite || null,
      location: location || null,
      bio: bio || null,
      linkedin_url: linkedinUrl || null,
      twitter_url: twitterUrl || null,
      website_url: websiteUrl || null,
      interests,
      industries,
      topics,
      default_follow_up_frequency: defaultFollowUpFrequency,
      default_view: defaultView,
      show_follow_up_reminders: showFollowUpReminders,
      email_notifications: emailNotifications,
    });
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Settings saved',
        description: 'Your profile has been updated',
      });
      setEditingSection(null);
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    toast({
      title: 'Account deletion requested',
      description: 'Please contact support to complete account deletion',
    });
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6 animate-fade-in">
        
        {/* Profile Header */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-2xl">
                {fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground truncate">
                {fullName || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              {professionOrRole && (
                <p className="text-sm text-muted-foreground mt-1">{professionOrRole}</p>
              )}
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">About Me</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingSection(editingSection === 'about' ? null : 'about')}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              {editingSection === 'about' ? 'Done' : 'Edit'}
            </Button>
          </div>
          
          <div className="p-5 space-y-4">
            {editingSection === 'about' ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role / Title</Label>
                  <Input
                    id="role"
                    value={professionOrRole}
                    onChange={(e) => setProfessionOrRole(e.target.value)}
                    placeholder="Product Manager"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="TechCorp"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://techcorp.io"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people a bit about yourself..."
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                {professionOrRole && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="text-foreground">{professionOrRole}</p>
                    </div>
                  </div>
                )}
                {(company || companyWebsite) && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="text-foreground">
                        {company}
                        {companyWebsite && (
                          <span className="text-muted-foreground"> · {companyWebsite}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-foreground">{location}</p>
                    </div>
                  </div>
                )}
                {bio && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-foreground">{bio}</p>
                  </div>
                )}
                {!professionOrRole && !company && !location && !bio && (
                  <p className="text-muted-foreground text-sm italic">
                    Add your professional info to help with connection matching
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Interests & Tags Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">My Interests & Tags</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingSection(editingSection === 'interests' ? null : 'interests')}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              {editingSection === 'interests' ? 'Done' : 'Edit'}
            </Button>
          </div>
          
          <div className="p-5">
            {editingSection === 'interests' ? (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Add your interests to find common ground with your connections.
                </p>
                
                <TagInput
                  label="Interests & Hobbies"
                  placeholder="Add interests like travel, cooking, hiking..."
                  value={interests}
                  onChange={setInterests}
                  suggestions={INTEREST_SUGGESTIONS}
                />
                
                <TagInput
                  label="Industries I Work In"
                  placeholder="Add industries like tech, finance, healthcare..."
                  value={industries}
                  onChange={setIndustries}
                  suggestions={INDUSTRY_SUGGESTIONS}
                />
                
                <TagInput
                  label="Topics I Love Discussing"
                  placeholder="Add topics like AI, remote work, investing..."
                  value={topics}
                  onChange={setTopics}
                  suggestions={TOPIC_SUGGESTIONS}
                />
                
                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interests.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {industries.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {industries.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {topics.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {topics.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {interests.length === 0 && industries.length === 0 && topics.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">
                    Add your interests to find common ground with your connections
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Social Links Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Social Links</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingSection(editingSection === 'social' ? null : 'social')}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              {editingSection === 'social' ? 'Done' : 'Edit'}
            </Button>
          </div>
          
          <div className="p-5">
            {editingSection === 'social' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedinUrl && (
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <span className="font-medium">in</span>
                    <span className="truncate">{linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
                {twitterUrl && (
                  <a 
                    href={twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <span className="font-medium">𝕏</span>
                    <span className="truncate">{twitterUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
                {websiteUrl && (
                  <a 
                    href={websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <span className="font-medium">🌐</span>
                    <span className="truncate">{websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
                {!linkedinUrl && !twitterUrl && !websiteUrl && (
                  <p className="text-muted-foreground text-sm italic">
                    Add your social links
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Preferences</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Default Follow-up Frequency</Label>
              <Select value={defaultFollowUpFrequency} onValueChange={setDefaultFollowUpFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Default View</Label>
              <Select value={defaultView} onValueChange={setDefaultView}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Show follow-up reminders</p>
                <p className="text-xs text-muted-foreground">Display reminders for overdue follow-ups</p>
              </div>
              <Switch
                checked={showFollowUpReminders}
                onCheckedChange={setShowFollowUpReminders}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Email notifications</p>
                <p className="text-xs text-muted-foreground">Receive emails for overdue follow-ups</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </Button>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Security</h2>
          </div>
          <div className="p-5">
            <Button variant="outline" onClick={() => navigate('/forgot-password')} className="w-full">
              Change Password
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card rounded-xl border border-destructive/30 overflow-hidden">
          <div className="p-5 border-b border-destructive/30">
            <h2 className="font-semibold text-destructive">Danger Zone</h2>
          </div>
          <div className="p-5 space-y-3">
            <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your connections, notes, and data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </main>
    </div>
  );
}
