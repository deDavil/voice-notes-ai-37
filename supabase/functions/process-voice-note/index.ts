import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();

    if (!audio) {
      throw new Error('No audio data provided');
    }

    const DEEPGRAM_API_KEY = Deno.env.get('DEEPGRAM_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY is not configured');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice note - starting transcription...');

    // Decode base64 audio
    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    
    // Step 1: Transcribe with Deepgram
    const transcriptionResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: binaryAudio,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Deepgram error:', errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcription = transcriptionData.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    console.log('Transcription complete:', transcription.substring(0, 100) + '...');

    if (!transcription || transcription.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No speech detected in the recording. Please try again and speak clearly.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 2: Extract structured data with AI
    console.log('Starting AI extraction...');

    const extractionPrompt = `You are an assistant that extracts structured information from voice note transcriptions about people someone has met.

Given this transcription, extract the following information. If something is not mentioned, leave it as null or empty array. Do not make up information that isn't stated or clearly implied.

Transcription:
"""
${transcription}
"""

Return a JSON object with these fields:
{
  "name": "string or null - the person's name",
  "how_we_met": "string or null - context of meeting (event, location, introduction)",
  "profession_or_role": "string or null - their job, role, or what they do",
  "key_interests": ["array of strings - hobbies, interests, passions mentioned"],
  "important_facts": ["array of strings - notable things about them"],
  "relationship_type": "string - one of: professional, personal, networking, other",
  "suggested_tags": ["array of strings - relevant tags based on context"],
  "follow_up_actions": ["array of strings - any mentioned next steps or todos"],
  "additional_context": "string or null - any other relevant information",
  "todos": [
    {
      "text": "concrete action item to do",
      "context": "brief context if helpful"
    }
  ],
  "suggestions": [
    {
      "text": "name of book/podcast/article/tool",
      "type": "book|podcast|article|tool|course|other",
      "context": "why they recommended it"
    }
  ],
  "suggested_follow_up_frequency": "weekly|biweekly|monthly|quarterly",
  "frequency_reasoning": "brief explanation for the suggested frequency"
}

EXTRACTION RULES FOR TODOS:
- Extract concrete actions the user should take
- Examples: "send them X", "introduce them to Y", "follow up about Z", "share the document"
- Do NOT include vague items like "stay in touch"

EXTRACTION RULES FOR SUGGESTIONS:
- Extract specific recommendations the person made
- Books, podcasts, articles, tools, courses, people to meet
- Include the name/title if mentioned
- Infer type from context (e.g., "read X" = book, "listen to X" = podcast)

FOLLOW-UP FREQUENCY RULES:
Based on the relationship context, suggest a follow-up frequency:
- "weekly" for: clients, warm leads, active deals, urgent collaborations
- "biweekly" for: investors, founders, active collaborators, mentors
- "monthly" for: general professional contacts, personal friends, mentees
- "quarterly" for: casual networking contacts, one-time meetings, distant connections
Return your suggestion in "suggested_follow_up_frequency" with brief reasoning in "frequency_reasoning".

Only return the JSON object, no other text.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: extractionPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            transcription 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI service credits depleted. Please add credits to continue.',
            transcription 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI extraction error:', errorText);
      // Return transcription even if extraction fails
      return new Response(
        JSON.stringify({ 
          transcription,
          extracted: null,
          extractionError: 'AI extraction failed - please fill in details manually'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const extractedContent = aiData.choices?.[0]?.message?.content || '';

    console.log('AI extraction complete');

    // Parse the JSON from AI response
    let extracted = null;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = extractedContent.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      extracted = JSON.parse(cleanedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', extractedContent);
    }

    return new Response(
      JSON.stringify({ 
        transcription, 
        extracted 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing voice note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
