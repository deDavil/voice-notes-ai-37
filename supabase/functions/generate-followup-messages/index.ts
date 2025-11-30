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
    // Validate Authorization header for authenticated requests
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { connectionId } = await req.json();

    if (!connectionId) {
      return new Response(
        JSON.stringify({ error: 'connectionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create RLS-aware Supabase client using user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // RLS will automatically filter to only user's connections
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select(`*, todos(text, is_completed)`)
      .eq("id", connectionId)
      .single();

    if (fetchError || !connection) {
      console.error("Error fetching connection:", fetchError);
      return new Response(
        JSON.stringify({ error: "Connection not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recentTodos = (connection.todos || [])
      .filter((t: any) => !t.is_completed)
      .slice(0, 3)
      .map((t: any) => t.text);

    const prompt = `You are helping someone reconnect with a contact. Generate 3 short, natural follow-up messages.

CONTACT INFO:
- Name: ${connection.name || 'Unknown'}
- Role: ${connection.profession_or_role || 'Unknown'}
- How we met: ${connection.how_we_met || 'Unknown'}
- Interests: ${(connection.key_interests || []).join(', ') || 'None recorded'}
- Important facts: ${(connection.important_facts || []).join('; ') || 'None recorded'}
- Relationship type: ${connection.relationship_type || 'professional'}
- Pending action items: ${recentTodos.join('; ') || 'None'}

RULES:
- Keep messages under 50 words each
- Sound natural and friendly, not robotic
- Reference specific details when possible
- Don't be pushy
- If there's a pending action item, the professional message should mention it
- If no interests are known, set the interest-based message text to null

Return JSON only:
{
  "messages": [
    { "type": "professional", "label": "💼 Professional", "text": "..." },
    { "type": "interest", "label": "🎯 Interest-based", "text": "..." or null if no interests },
    { "type": "casual", "label": "☕ Casual", "text": "..." }
  ]
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating follow-up messages for:", connection.name);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates natural, friendly follow-up messages. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits depleted." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate messages" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", aiData);
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let messages;
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      messages = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generated messages successfully for:", connection.name);

    return new Response(
      JSON.stringify(messages),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-followup-messages:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
