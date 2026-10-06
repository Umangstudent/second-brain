const Note = require('../models/Note');
const { paginate } = require('../utils/pagination');
const { generateEmbedding } = require('../services/embedding');
const { v4: uuidv4 } = require('uuid');

exports.getNotes = async (req, res) => {
  try {
    const { search, tags, page, limit, sort } = req.query;
    let query = { user: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    }

    const result = await paginate(Note, query, page, limit, sortObj);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;
    
    let embedding = [];
    try {
      embedding = await generateEmbedding(`${title} ${content || ''}`);
    } catch (embError) {
      console.error('Embedding generation failed:', embError);
    }

    const shareHash = isPublic ? uuidv4() : undefined;

    const note = await Note.create({
      user: req.user.id,
      title,
      content,
      tags,
      isPublic: !!isPublic,
      shareHash,
      embedding: embedding || []
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;

    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    
    if (isPublic !== undefined && isPublic !== note.isPublic) {
      note.isPublic = isPublic;
      note.shareHash = isPublic ? uuidv4() : undefined;
    }

    if (title !== undefined || content !== undefined) {
      try {
        const embedding = await generateEmbedding(`${note.title} ${note.content || ''}`);
        if (embedding) note.embedding = embedding;
      } catch (embError) {
        console.error('Embedding generation failed:', embError);
      }
    }

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleShare = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.isPublic = !note.isPublic;
    if (note.isPublic) {
      note.shareHash = uuidv4();
    } else {
      note.shareHash = undefined;
    }

    await note.save();
    res.json({ isPublic: note.isPublic, shareHash: note.shareHash });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
