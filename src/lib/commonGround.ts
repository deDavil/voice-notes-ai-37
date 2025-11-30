import { Profile } from '@/hooks/useAuth';
import { Connection } from '@/types/connection';

export interface CommonGround {
  interests: string[];
  industries: string[];
  topics: string[];
  total: number;
}

export function findCommonGround(userProfile: Profile | null, connection: Connection): CommonGround {
  const common: CommonGround = {
    interests: [],
    industries: [],
    topics: [],
    total: 0
  };

  if (!userProfile) return common;

  // Get user's tags
  const userInterests = userProfile.interests || [];
  const userIndustries = userProfile.industries || [];
  const userTopics = userProfile.topics || [];

  // Get connection's tags (lowercase for comparison)
  const connectionTags = (connection.tags || []).map(t => t.toLowerCase());

  // Find overlaps
  common.interests = userInterests.filter(i => 
    connectionTags.some(t => t.toLowerCase() === i.toLowerCase())
  );
  
  common.industries = userIndustries.filter(i => 
    connectionTags.some(t => t.toLowerCase() === i.toLowerCase())
  );
  
  common.topics = userTopics.filter(t => 
    connectionTags.some(ct => ct.toLowerCase() === t.toLowerCase())
  );

  common.total = common.interests.length + common.industries.length + common.topics.length;

  return common;
}

export function calculateMatchScore(userProfile: Profile | null, connection: Connection): number {
  if (!userProfile) return 0;
  
  const common = findCommonGround(userProfile, connection);
  
  const userTagCount = (userProfile.interests?.length || 0) + 
                       (userProfile.industries?.length || 0) + 
                       (userProfile.topics?.length || 0);
  
  if (userTagCount === 0) return 0;
  
  // Score from 0-100
  const score = Math.round((common.total / userTagCount) * 100);
  
  return Math.min(score, 100);
}
