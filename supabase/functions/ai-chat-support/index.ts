import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Message and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search knowledge base for relevant articles
    const { data: articles, error: kbError } = await supabase
      .from('knowledge_base')
      .select('title, content, category, tags')
      .eq('is_published', true);

    if (kbError) {
      console.error('Knowledge base query error:', kbError);
    }

    // Find relevant articles based on message content
    const relevantArticles = articles?.filter(article => {
      const searchText = message.toLowerCase();
      const articleText = `${article.title} ${article.content} ${article.tags?.join(' ')}`.toLowerCase();
      
      return articleText.includes(searchText) ||
             searchText.includes(article.category) ||
             article.tags?.some((tag: string) => searchText.includes(tag.toLowerCase()));
    }) || [];

    // Prepare context from knowledge base
    let contextString = "";
    if (relevantArticles.length > 0) {
      contextString = "Based on our knowledge base, here's relevant information:\n\n";
      relevantArticles.slice(0, 3).forEach(article => {
        contextString += `**${article.title}**\n${article.content}\n\n`;
      });
    }

    // Simple rule-based responses for common queries
    const getRuleBasedResponse = (message: string): string | null => {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('battery') && lowerMessage.includes('charge')) {
        return "To charge your scooter battery properly:\n1. Use only the provided charger\n2. Plug into a dry, well-ventilated area\n3. Charging time is typically 3-4 hours\n4. Unplug when fully charged\n5. The LED indicator will show green when complete\n\nAvoid overcharging to extend battery life!";
      }
      
      if (lowerMessage.includes('scooter') && (lowerMessage.includes('start') || lowerMessage.includes('turn on'))) {
        return "If your scooter won't start, try these steps:\n1. Check if the power button is pressed and held for 3 seconds\n2. Ensure the kickstand is up\n3. Verify the battery is charged (check LED indicators)\n4. Make sure brake levers are released\n5. Check for error codes on display\n6. Ensure you're standing properly on the deck\n\nIf issues persist, please create a support ticket for further assistance.";
      }
      
      if (lowerMessage.includes('maintenance') || lowerMessage.includes('care')) {
        return "Daily maintenance checklist:\n1. Check tire pressure and condition\n2. Test brake function\n3. Verify battery charge level\n4. Ensure lights and signals work\n5. Check steering and folding mechanism\n6. Clean debris from wheels\n7. Inspect for any loose parts\n\nRegular maintenance keeps your scooter safe and extends its lifespan!";
      }
      
      if (lowerMessage.includes('safety') || lowerMessage.includes('helmet')) {
        return "Essential safety guidelines:\n1. Always wear a helmet (required by law in many areas)\n2. Use reflective clothing in low light conditions\n3. Follow local traffic laws and regulations\n4. Stay in bike lanes when available\n5. Avoid riding in rain or wet conditions\n6. Perform regular safety equipment inspections\n7. Keep both hands on handlebars\n8. Don't exceed weight limits\n\nYour safety is our priority!";
      }
      
      if (lowerMessage.includes('range') || lowerMessage.includes('distance')) {
        return "Scooter range depends on several factors:\n• Battery charge level\n• Rider weight\n• Terrain (hills reduce range)\n• Weather conditions\n• Speed settings\n• Tire pressure\n\nTypical range is 15-25 miles on a full charge. To maximize range:\n- Keep tires properly inflated\n- Use eco mode when possible\n- Avoid excessive acceleration\n- Charge battery regularly";
      }
      
      if (lowerMessage.includes('speed') || lowerMessage.includes('fast')) {
        return "Speed settings and limits:\n• Eco mode: Up to 12 mph (best for range)\n• Normal mode: Up to 18 mph (balanced performance)\n• Sport mode: Up to 25 mph (maximum speed)\n\nSpeed may be limited by:\n- Local regulations\n- Battery level\n- Weather conditions\n- Terrain\n\nAlways comply with local speed limits and safety regulations!";
      }
      
      if (lowerMessage.includes('app') || lowerMessage.includes('connect')) {
        return "To connect your scooter to the app:\n1. Download the EcoRide app from app store\n2. Enable Bluetooth on your device\n3. Turn on your scooter\n4. Open the app and tap 'Connect Device'\n5. Select your scooter from the list\n6. Follow pairing instructions\n\nThe app allows you to:\n- Lock/unlock remotely\n- Check battery status\n- View ride statistics\n- Update firmware\n- Find nearby charging stations";
      }
      
      return null;
    };

    // Try rule-based response first
    let response = getRuleBasedResponse(message);
    
    // If no rule-based response and we have relevant articles, use them
    if (!response && relevantArticles.length > 0) {
      response = `${contextString}Is there anything specific about this topic you'd like to know more about? I'm here to help with any questions about your EcoRide scooter!`;
    }
    
    // Fallback response
    if (!response) {
      response = `I'd be happy to help you with your EcoRide scooter question! 

Common topics I can assist with:
• Battery charging and maintenance
• Scooter startup and operation
• Safety guidelines and equipment
• Daily maintenance checklist
• App connectivity and features
• Troubleshooting common issues

Could you please provide more details about what you need help with? You can also create a support ticket if you need personalized assistance from our support team.`;
    }

    // Save conversation to database
    const { error: saveError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        message: message,
        response: response,
        knowledge_base_used: relevantArticles.length > 0,
        created_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving conversation:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        response,
        knowledgeBaseUsed: relevantArticles.length > 0,
        relevantArticles: relevantArticles.slice(0, 2).map(a => ({ title: a.title, category: a.category }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat-support function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request',
        response: "I'm sorry, I'm having trouble responding right now. Please try again or create a support ticket for assistance."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});