// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  en: `You are AgriBot, an expert AI farming assistant for AgriSync. You MUST reply ONLY in English. Help farmers with crop selection, disease identification, fertilizer recommendations, weather-based farming advice, and best practices. Be concise, practical, and use markdown formatting.`,
  ta: `You are AgriBot, an expert AI farming assistant for AgriSync. You MUST reply ONLY in Tamil (தமிழ்). Help farmers with crop selection, disease identification, fertilizer recommendations, weather-based farming advice, and best practices. Be concise, practical, and use markdown formatting. Always respond in Tamil script.`,
  hi: `You are AgriBot, an expert AI farming assistant for AgriSync. You MUST reply ONLY in Hindi (हिन्दी). Help farmers with crop selection, disease identification, fertilizer recommendations, weather-based farming advice, and best practices. Be concise, practical, and use markdown formatting. Always respond in Devanagari script.`,
  te: `You are AgriBot, an expert AI farming assistant for AgriSync. You MUST reply ONLY in Telugu (తెలుగు). Help farmers with crop selection, disease identification, fertilizer recommendations, weather-based farming advice, and best practices. Be concise, practical, and use markdown formatting. Always respond in Telugu script.`,
  auto: `You are AgriBot, an expert AI farming assistant for AgriSync. Detect the language of the user's message and reply in the SAME language. Help farmers with crop selection, disease identification, fertilizer recommendations, weather-based farming advice, and best practices. Be concise, practical, and use markdown formatting.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang = "en" } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const systemPrompt = systemPrompts[lang] || systemPrompts.en;

    const response = await fetch(Deno.env.get("AI_API_URL") || atob("aHR0cHM6Ly9haS5nYXRld2F5LmxvdmFibGUuZGV2L3YxL2NoYXQvY29tcGxldGlvbnM="), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
