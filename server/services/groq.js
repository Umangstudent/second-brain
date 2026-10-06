const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const chatWithContext = async (question, contextDocs) => {
  try {
    let contextString = 'Context:\n';
    if (contextDocs && contextDocs.length > 0) {
      contextDocs.forEach((doc, index) => {
        contextString += `[${index + 1}] Type: ${doc.type}, Title: ${doc.title}\nContent: ${doc.content}\n\n`;
      });
    } else {
      contextString += 'No relevant context found.\n';
    }

    const systemPrompt = `You are Second Brain AI, a helpful assistant. Answer the user's question based on their saved content provided as context. If the context doesn't contain relevant information, say so. Be concise and helpful. Reference specific notes/links/documents when applicable.\n\n${contextString}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate an answer.';
  } catch (error) {
    console.error('Groq chat error:', error);
    throw new Error('Failed to chat with AI');
  }
};

module.exports = { chatWithContext };
