export async function POST(request: Request): Promise<Response> {
  try {
    const { message } = await request.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Spanish language learning assistant. The user message fills in the blank: "what does _____ mean?" IMPORTANT: You must respond ONLY in English. Explain the meaning of the Spanish word or phrase in clear, simple English. Do not repeat the Spanish word or phrase in your explanation.'


          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    return Response.json({ response: aiResponse });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}