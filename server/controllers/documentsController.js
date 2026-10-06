const fs = require('fs');
const Document = require('../models/Document');
const { paginate } = require('../utils/pagination');
const { generateEmbedding } = require('../services/embedding');
const { v4: uuidv4 } = require('uuid');

exports.getDocuments = async (req, res) => {
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

    const result = await paginate(Document, query, page, limit, sortObj);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { title, tags, isPublic } = req.body;
    let content = '';

    if (req.file) {
      try {
        content = fs.readFileSync(req.file.path, 'utf8');
      } catch (readError) {
        console.error('Error reading file:', readError);
        content = ''; // Fallback or handle differently based on fileType
      }
    }

    let embedding = [];
    try {
      embedding = await generateEmbedding(`${title} ${content}`);
    } catch (embError) {
      console.error('Embedding generation failed:', embError);
    }

    const shareHash = isPublic === 'true' || isPublic === true ? uuidv4() : undefined;

    const doc = await Document.create({
      user: req.user.id,
      title,
      content,
      originalName: req.file ? req.file.originalname : undefined,
      fileSize: req.file ? req.file.size : undefined,
      fileType: req.file ? req.file.mimetype : undefined,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      isPublic: isPublic === 'true' || isPublic === true,
      shareHash,
      embedding: embedding || []
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, tags, isPublic } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (title !== undefined) doc.title = title;
    if (tags !== undefined) doc.tags = Array.isArray(tags) ? tags : tags.split(',');
    
    if (isPublic !== undefined) {
      const publicFlag = isPublic === 'true' || isPublic === true;
      if (publicFlag !== doc.isPublic) {
        doc.isPublic = publicFlag;
        doc.shareHash = publicFlag ? uuidv4() : undefined;
      }
    }

    if (title !== undefined) {
      try {
        const embedding = await generateEmbedding(`${doc.title} ${doc.content || ''}`);
        if (embedding) doc.embedding = embedding;
      } catch (embError) {
        console.error('Embedding generation failed:', embError);
      }
    }

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleShare = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    doc.isPublic = !doc.isPublic;
    if (doc.isPublic) {
      doc.shareHash = uuidv4();
    } else {
      doc.shareHash = undefined;
    }

    await doc.save();
    res.json({ isPublic: doc.isPublic, shareHash: doc.shareHash });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
