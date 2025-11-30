import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ArrowLeft, Loader2, Save, LogOut, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [defaultFollowUpFrequency, setDefaultFollowUpFrequency] = useState(profile?.default_follow_up_frequency || 'monthly');
  const [defaultView, setDefaultView] = useState(profile?.default_view || 'list');
  const [showFollowUpReminders, setShowFollowUpReminders] = useState(profile?.show_follow_up_reminders ?? true);
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
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
        description: 'Your preferences have been updated',
      });
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // Note: Full account deletion would typically require a server-side function
    // For now, we sign out the user
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
        <div className="max-w-5xl mx-auto px-6 py-4">
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

      <main className="max-w-xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
        {/* Profile Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">
                  {fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{fullName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

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
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-secondary"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          <div className="bg-card rounded-xl p-5 border border-border space-y-4">
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
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Preferences
            </Button>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <div className="bg-card rounded-xl p-5 border border-border">
            <Button variant="outline" onClick={() => navigate('/forgot-password')} className="w-full">
              Change Password
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <div className="bg-card rounded-xl p-5 border border-border space-y-3">
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
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
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
