import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    console.log("Generating activity suggestions for user:", user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Get connections with tags
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user.id)
      .not('tags', 'is', null);

    if (connectionsError) {
      console.error("Error fetching connections:", connectionsError);
      throw connectionsError;
    }

    // Get user's interests
    const userInterests = [
      ...(profile?.interests || []),
      ...(profile?.industries || []),
      ...(profile?.topics || [])
    ].map(i => i.toLowerCase());

    console.log("User interests:", userInterests);

    // Find connections with overlapping interests
    const connectionsWithMatch = (connections || [])
      .filter(c => {
        const connectionTags = (c.tags || []).map((t: string) => t.toLowerCase());
        const overlap = connectionTags.filter((t: string) => 
          userInterests.some(ui => ui === t)
        );
        return overlap.length > 0;
      })
      .map(c => {
        const connectionTags = (c.tags || []).map((t: string) => t.toLowerCase());
        return {
          ...c,
          sharedInterests: connectionTags.filter((t: string) => 
            userInterests.some(ui => ui === t)
          )
        };
      })
      .slice(0, 5); // Limit to 5 candidates

    console.log("Connections with shared interests:", connectionsWithMatch.length);

    if (connectionsWithMatch.length === 0) {
      return new Response(JSON.stringify({ suggestions: [], expires_at: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Generate suggestions with AI
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const prompt = `You are generating activity suggestions for someone to do with their connections.

USER'S INTERESTS: ${userInterests.join(', ')}

CONNECTIONS WITH SHARED INTERESTS:
${connectionsWithMatch.map(c => `
- ${c.name}: shared interests = ${c.sharedInterests.join(', ')}
  Role: ${c.profession_or_role || 'Unknown'}
  Location: ${c.location || 'Unknown'}
`).join('\n')}

TODAY'S DATE: ${dateStr}
DAY: ${dayOfWeek}
MONTH: ${month}

Generate 2-3 TIMELY activity suggestions. Each should:
1. Reference a shared interest
2. Include a timely hook (this weekend, this season, new opening, upcoming event, weather-related, etc.)
3. Be specific and actionable
4. Feel natural and fun, not forced

Return JSON only (no markdown, no code blocks):
{
  "suggestions": [
    {
      "connection_name": "Name",
      "shared_interest": "skiing",
      "emoji": "🎿",
      "title": "Skiing with Name",
      "description": "You both love skiing! Tahoe opens this weekend - perfect time to plan a trip together."
    }
  ]
}

Keep descriptions under 100 characters. Be creative with the timely hooks - reference seasons, weekends, weather, events, holidays, etc.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates activity suggestions. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log("AI response:", aiContent);

    let suggestions: any[] = [];
    
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = aiContent.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();

      const parsed = JSON.parse(cleanedContent);
      suggestions = parsed.suggestions || [];
      
      // Map connection IDs
      suggestions = suggestions.map((s: any) => {
        const conn = connectionsWithMatch.find(c => 
          c.name?.toLowerCase() === s.connection_name?.toLowerCase()
        );
        return {
          ...s,
          id: crypto.randomUUID(),
          connection_id: conn?.id
        };
      }).filter((s: any) => s.connection_id); // Only keep valid matches
      
    } catch (e) {
      console.error("Failed to parse AI suggestions:", e);
      suggestions = [];
    }

    console.log("Parsed suggestions:", suggestions.length);

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Delete old suggestions for this user
    await supabase
      .from('activity_suggestions')
      .delete()
      .eq('user_id', user.id);

    // Save new suggestions to database
    for (const suggestion of suggestions) {
      const { error: insertError } = await supabase.from('activity_suggestions').insert({
        user_id: user.id,
        connection_id: suggestion.connection_id,
        connection_name: suggestion.connection_name,
        shared_interest: suggestion.shared_interest,
        emoji: suggestion.emoji,
        title: suggestion.title,
        description: suggestion.description,
        expires_at: expiresAt.toISOString()
      });

      if (insertError) {
        console.error("Error inserting suggestion:", insertError);
      }
    }

    console.log("Activity suggestions generated successfully");

    return new Response(JSON.stringify({ 
      suggestions: suggestions.map(s => ({
        ...s,
        expires_at: expiresAt.toISOString()
      })), 
      expires_at: expiresAt.toISOString() 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error generating activity suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
