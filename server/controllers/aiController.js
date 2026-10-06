const Note = require('../models/Note');
const Link = require('../models/Link');
const Document = require('../models/Document');
const { generateEmbedding, cosineSimilarity } = require('../services/embedding');
const { chatWithContext } = require('../services/groq');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const messageEmbedding = await generateEmbedding(message);
    if (!messageEmbedding) return res.status(500).json({ error: 'Failed to generate embedding' });

    const [notes, links, docs] = await Promise.all([
      Note.find({ user: req.user.id, embedding: { $exists: true, $not: { $size: 0 } } }),
      Link.find({ user: req.user.id, embedding: { $exists: true, $not: { $size: 0 } } }),
      Document.find({ user: req.user.id, embedding: { $exists: true, $not: { $size: 0 } } })
    ]);

    const allItems = [
      ...notes.map(n => ({ type: 'note', id: n._id, title: n.title, content: n.content, embedding: n.embedding })),
      ...links.map(l => ({ type: 'link', id: l._id, title: l.title, content: l.description + ' ' + l.url, embedding: l.embedding })),
      ...docs.map(d => ({ type: 'document', id: d._id, title: d.title, content: d.content, embedding: d.embedding }))
    ];

    const similarities = allItems.map(item => ({
      ...item,
      score: cosineSimilarity(messageEmbedding, item.embedding)
    }));

    similarities.sort((a, b) => b.score - a.score);
    const topItems = similarities.slice(0, 5);

    const sources = topItems.map(item => ({ type: item.type, title: item.title, id: item.id }));

    const answer = await chatWithContext(message, topItems);

    res.json({ answer, sources });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
