import { Linkedin, Twitter, Instagram, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLinksProps {
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  website?: string | null;
  className?: string;
}

const socialConfig = [
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', hoverColor: 'hover:text-[#0077B5] hover:bg-[#0077B5]/10' },
  { key: 'twitter', icon: Twitter, label: 'Twitter', hoverColor: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10' },
  { key: 'instagram', icon: Instagram, label: 'Instagram', hoverColor: 'hover:text-[#E4405F] hover:bg-[#E4405F]/10' },
  { key: 'website', icon: Globe, label: 'Website', hoverColor: 'hover:text-primary hover:bg-primary/10' },
] as const;

export function SocialLinks({ linkedin, twitter, instagram, website, className }: SocialLinksProps) {
  const links: { url: string; config: typeof socialConfig[number] }[] = [];
  
  if (linkedin) links.push({ url: linkedin, config: socialConfig[0] });
  if (twitter) links.push({ url: twitter, config: socialConfig[1] });
  if (instagram) links.push({ url: instagram, config: socialConfig[2] });
  if (website) links.push({ url: website, config: socialConfig[3] });

  if (links.length === 0) return null;

  return (
    <div className={cn("flex gap-2", className)}>
      {links.map(({ url, config }) => {
        const Icon = config.icon;
        return (
          <a
            key={config.key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-2 rounded-lg text-muted-foreground transition-colors",
              "bg-muted/50",
              config.hoverColor
            )}
            title={config.label}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}
