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

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice note - starting transcription with ElevenLabs...');

    // Decode base64 audio
    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    
    // Create FormData for ElevenLabs API
    const formData = new FormData();
    const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model_id', 'scribe_v1');

    // Step 1: Transcribe with ElevenLabs
    const transcriptionResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('ElevenLabs error:', errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcription = transcriptionData.text || '';

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

    const extractionPrompt = `You are extracting ONLY high-value, lasting information from a voice note about someone the user met or spoke with.

TRANSCRIPTION:
"""
${transcription}
"""

CRITICAL RULES - READ CAREFULLY:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT FACTS - Extract SPECIFIC, LASTING details as separate items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each fact should be a separate "bubble" - specific details the user would want to remember.

✅ INCLUDE (each as separate item):
- Family members with NAMES (e.g., "Dog named Max", "Daughter named Sophie, age 7")
- Specific places (e.g., "Lives in Brooklyn Heights", "Works at Google")
- Role/profession details
- Alma mater (e.g., "Went to Stanford")
- Specific hobbies with details (e.g., "Runs marathons", "Plays guitar in a band")
- Health conditions or important personal circumstances
- Significant achievements or milestones

❌ EXCLUDE:
- Generic descriptions without specifics
- Temporary situations ("busy this week", "traveling for work")
- One-time events ("had a playdate Saturday")
- Current mood or feelings
- Anything that won't matter in 3 months

FORMAT: Each fact should be brief (3-8 words) and self-contained.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAGS - MUST start with "Personal" or "Professional" category
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: Every tag MUST begin with either "Personal" or "Professional" as the FIRST tag.

Structure:
- First tag: "Personal" OR "Professional" (based on relationship nature)
- Remaining tags (2-4 more): Brief descriptors including interests

For interests mentioned, add them as BRIEF tags (1-2 words):
- "dogs" not "loves dogs" or "dog owner"
- "yoga" not "practices yoga"
- "cooking" not "enjoys cooking"
- "tech" or "AI" for technology interests

Industry/context tags:
- tech, finance, healthcare, creative, education, legal, marketing, design
- conference, meetup, introduction, work, social, alumni, referral

RULES:
- Maximum 5 tags total
- First tag MUST be "Personal" or "Professional"
- Keep interest tags to single words when possible
- Don't duplicate information already in important_facts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TO-DOs - Only extract CONCRETE COMMITMENTS you must act on
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ INCLUDE:
- Specific promised actions ("send the pitch deck", "make an intro")
- Agreed deliverables with clear outcomes
- Committed meetings or follow-ups

❌ EXCLUDE:
- Vague intentions ("stay in touch", "catch up sometime")
- Multiple options for the same task (pick the most likely one)
- The other person's tasks (only YOUR action items)
- Wishes without commitment ("we should do coffee")

CONSOLIDATION RULE: If multiple options are given for ONE task, extract as ONE to-do with the most concrete option.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUGGESTIONS - Only extract EXPLICIT recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ INCLUDE:
- Specific book/podcast/article titles they recommended
- Tools or products they suggested you try
- People they said you should meet

❌ EXCLUDE:
- Things they mentioned using (unless explicitly recommended)
- General topics discussed (not recommendations)
- Anything without a specific name/title

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLLOW-UP ACTIONS - Brief, actionable next steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ INCLUDE:
- Confirmed plans with time/place
- Agreed next conversations or meetings
- Maximum 2 items

❌ EXCLUDE:
- Duplicates of TO-DOs
- Vague "maybe" plans
- Wishes without agreement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLLOW-UP FREQUENCY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on the relationship context, suggest a follow-up frequency:
- "weekly" for: clients, warm leads, active deals, urgent collaborations
- "biweekly" for: investors, founders, active collaborators, mentors
- "monthly" for: general professional contacts, personal friends, mentees
- "quarterly" for: casual networking contacts, one-time meetings, distant connections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return JSON:
{
  "name": "string or null",
  "how_we_met": "string or null - brief context, one sentence max",
  "profession_or_role": "string or null",
  "key_interests": [],
  "important_facts": ["separate bubble for each specific fact - names, places, details"],
  "relationship_type": "professional|personal|networking|other",
  "suggested_tags": ["MUST start with Personal or Professional", "then brief interest/context tags"],
  "follow_up_actions": ["max 2 concrete next steps"],
  "todos": [
    {
      "text": "single consolidated action item",
      "context": "brief context if helpful"
    }
  ],
  "suggestions": [
    {
      "text": "specific title or name",
      "type": "book|podcast|article|tool|course|person|other",
      "context": "why they recommended it"
    }
  ],
  "suggested_follow_up_frequency": "weekly|biweekly|monthly|quarterly",
  "frequency_reasoning": "brief explanation for the suggested frequency",
  "additional_context": "1-2 sentence summary of conversation context, only if adds value - otherwise null"
}

FINAL CHECK before responding:
1. Does the first tag start with "Personal" or "Professional"? If not, fix it.
2. Are specific details (names, places) in important_facts as separate items? 
3. Are interest tags brief (1-2 words)?
4. Would each "important fact" still matter in 3 months? If no, remove it.
5. Are there duplicate TO-DOs? Consolidate them.

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
