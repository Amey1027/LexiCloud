import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, parties, purpose, additionalDetails } = await req.json();

    const prompt = `You are an expert Indian legal document drafter. Generate a professional, legally sound ${documentType} based on the following information:

Parties Involved: ${parties}
Purpose: ${purpose}
Additional Details: ${additionalDetails}

Requirements:
1. Follow Indian legal standards and formatting
2. Include all necessary clauses and provisions
3. Use proper legal terminology
4. Include standard boilerplate clauses (governing law, dispute resolution, etc.)
5. Make it comprehensive yet clear
6. Add placeholders for signatures and dates

Generate the complete legal document now.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const generatedDocument = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ document: generatedDocument }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
