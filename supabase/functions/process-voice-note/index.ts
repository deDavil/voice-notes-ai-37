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

    const extractionPrompt = `You are extracting ONLY high-value, lasting information from a voice note about someone the user met or spoke with.

TRANSCRIPTION:
"""
${transcription}
"""

CRITICAL RULES - READ CAREFULLY:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT FACTS - Only extract LASTING information about the person
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ INCLUDE:
- Family structure (spouse name, children names/ages)
- Profession, company, role
- Where they live (city/neighborhood)
- Long-term interests or hobbies
- Significant life facts (alma mater, hometown, major achievements)
- Health conditions or important personal circumstances

❌ EXCLUDE:
- Temporary situations ("busy this week", "traveling for work")
- One-time events ("had a playdate Saturday")
- Object descriptions ("purple unicorn with sparkly horn")
- Current mood or feelings
- Anything that won't matter in 3 months

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
Example: "drop off Friday or meet Saturday" → Single TO-DO: "Return item (Saturday park meetup or Friday drop-off)"

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
TAGS - Maximum 3-4 most relevant tags
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Select from:
- Relationship: professional, personal, networking, mentor, client, investor, founder
- Industry: tech, finance, healthcare, creative, education, legal, marketing, design
- Context: conference, meetup, introduction, work, social, alumni, referral

RULES:
- Maximum 4 tags total
- Prioritize: 1 relationship tag + 1-2 most specific descriptors
- Don't tag obvious things (e.g., don't tag "friend" if already "personal")

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
  "key_interests": ["max 3 lasting interests or hobbies"],
  "important_facts": ["max 3-4 LASTING facts that will matter in 3+ months"],
  "relationship_type": "professional|personal|networking|other",
  "suggested_tags": ["max 4 tags"],
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
1. Would each "important fact" still matter in 3 months? If no, remove it.
2. Are there duplicate TO-DOs? Consolidate them.
3. Are there more than 4 tags? Remove the least specific ones.
4. Is "additional_context" just repeating other fields? If yes, set to null.

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
