const Note = require('../models/Note');
const Link = require('../models/Link');
const Document = require('../models/Document');

exports.getSharedContent = async (req, res) => {
  try {
    const { hash } = req.params;

    const note = await Note.findOne({ shareHash: hash, isPublic: true }).select('-embedding');
    if (note) return res.json({ type: 'note', data: note });

    const link = await Link.findOne({ shareHash: hash, isPublic: true }).select('-embedding');
    if (link) return res.json({ type: 'link', data: link });

    const doc = await Document.findOne({ shareHash: hash, isPublic: true }).select('-embedding');
    if (doc) return res.json({ type: 'document', data: doc });

    res.status(404).json({ error: 'Shared content not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
