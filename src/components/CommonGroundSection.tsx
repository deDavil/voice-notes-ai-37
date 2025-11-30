import { Profile } from '@/hooks/useAuth';
import { Connection } from '@/types/connection';
import { findCommonGround } from '@/lib/commonGround';
import { Sparkles } from 'lucide-react';

interface CommonGroundSectionProps {
  userProfile: Profile | null;
  connection: Connection;
}

export function CommonGroundSection({ userProfile, connection }: CommonGroundSectionProps) {
  const common = findCommonGround(userProfile, connection);
  
  if (common.total === 0) return null;
  
  return (
    <div className="bg-accent rounded-xl p-4 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-medium text-accent-foreground">Common Ground</h3>
      </div>
      
      <p className="text-sm text-accent-foreground/80 mb-3">You both share:</p>
      
      <div className="space-y-3">
        {common.interests.length > 0 && (
          <div>
            <p className="text-xs font-medium text-primary mb-1.5">🎯 Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {common.interests.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-card text-primary text-xs rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {common.industries.length > 0 && (
          <div>
            <p className="text-xs font-medium text-primary mb-1.5">💼 Industries</p>
            <div className="flex flex-wrap gap-1.5">
              {common.industries.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-card text-primary text-xs rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {common.topics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-primary mb-1.5">💬 Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {common.topics.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-card text-primary text-xs rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-accent-foreground/60 mt-3 italic">
        Great conversation starters!
      </p>
    </div>
  );
}
