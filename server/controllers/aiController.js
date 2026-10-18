const Note = require('../models/Note');
const Link = require('../models/Link');
const Document = require('../models/Document');
const { generateEmbedding, cosineSimilarity } = require('../services/embedding');
const { chatWithContext } = require('../services/groq');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    let messageEmbedding = null;
    try {
      messageEmbedding = await generateEmbedding(message);
    } catch (e) {
      console.warn('Embedding generation warning:', e);
    }

    const [notes, links, docs] = await Promise.all([
      Note.find({ user: req.user.id }),
      Link.find({ user: req.user.id }),
      Document.find({ user: req.user.id })
    ]);

    const allItems = [
      ...notes.map(n => ({ type: 'note', id: n._id, title: n.title, content: n.content, embedding: n.embedding })),
      ...links.map(l => ({ type: 'link', id: l._id, title: l.title, content: (l.description || '') + ' ' + (l.url || ''), embedding: l.embedding })),
      ...docs.map(d => ({ type: 'document', id: d._id, title: d.title, content: d.content, embedding: d.embedding }))
    ];

    let topItems = [];
    if (messageEmbedding && allItems.length > 0) {
      const similarities = allItems.map(item => ({
        ...item,
        score: item.embedding && item.embedding.length ? cosineSimilarity(messageEmbedding, item.embedding) : 0
      }));
      similarities.sort((a, b) => b.score - a.score);
      topItems = similarities.slice(0, 5).filter(i => i.score > 0.1);
    } else {
      topItems = allItems.slice(0, 5);
    }

    const sources = topItems.map(item => ({ type: item.type, title: item.title, id: item.id }));
    const answer = await chatWithContext(message, topItems);

    res.json({ answer, reply: answer, sources });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
