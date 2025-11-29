import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PhotoUploadProps {
  currentUrl: string | null;
  onUpload?: (url: string) => void;
  name?: string | null;
  disabled?: boolean;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PhotoUpload({ currentUrl, onUpload, name, disabled }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('connection-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('connection-photos')
        .getPublicUrl(fileName);

      onUpload?.(urlData.publicUrl);
      toast.success('Photo uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-24 h-24 group">
      <Avatar className="w-24 h-24">
        <AvatarImage src={currentUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
          {name ? getInitials(name) : <User className="w-10 h-10" />}
        </AvatarFallback>
      </Avatar>

      {!disabled && (
        <label
          className={cn(
            "absolute inset-0 rounded-full flex items-center justify-center",
            "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          )}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
