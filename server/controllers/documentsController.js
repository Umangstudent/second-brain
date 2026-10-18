const fs = require('fs');
const Document = require('../models/Document');
const { paginate } = require('../utils/pagination');
const { generateEmbedding } = require('../services/embedding');
const { v4: uuidv4 } = require('uuid');

exports.getDocuments = async (req, res) => {
  try {
    const { tags, page, limit, sort, all } = req.query;
    const searchTerm = req.query.search || req.query.q;
    const isAdmin = req.user.role === 'admin';
    let query = (isAdmin && all === 'true') ? {} : { user: req.user.id };

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort === 'newest') sortObj = { createdAt: -1 };
      else if (sort === 'oldest') sortObj = { createdAt: 1 };
      else if (sort === 'az') sortObj = { title: 1 };
      else if (sort === 'za') sortObj = { title: -1 };
      else if (sort.includes(':')) {
        const [field, order] = sort.split(':');
        sortObj[field] = order === 'asc' ? 1 : -1;
      }
    }

    const result = await paginate(Document, query, page, limit, sortObj);
    res.json(result);
  } catch (error) {
    console.error('getDocuments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const doc = await Document.findOne(filter);
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
      const isText = req.file.mimetype?.startsWith('text/') ||
        req.file.mimetype === 'application/json' ||
        /\.(txt|md|csv|json|js|jsx|ts|tsx|html|css|py)$/i.test(req.file.originalname);

      if (isText) {
        try {
          content = fs.readFileSync(req.file.path, 'utf8').slice(0, 5000);
        } catch (readError) {
          content = '';
        }
      } else {
        content = `Uploaded file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`;
      }
    }

    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else {
        try {
          const parsed = JSON.parse(tags);
          parsedTags = Array.isArray(parsed) ? parsed : [tags];
        } catch {
          parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
    }

    const shareHash = isPublic === 'true' || isPublic === true ? uuidv4() : undefined;

    const doc = await Document.create({
      user: req.user.id,
      title: title || (req.file ? req.file.originalname : 'Untitled Document'),
      content,
      originalName: req.file ? req.file.originalname : undefined,
      fileSize: req.file ? req.file.size : undefined,
      fileType: req.file ? req.file.mimetype : undefined,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      filePath: req.file ? req.file.path : undefined,
      tags: parsedTags,
      isPublic: isPublic === 'true' || isPublic === true,
      shareHash,
      embedding: []
    });

    // Generate embedding in background so user doesn't wait 90 seconds
    const textToEmbed = `${doc.title} ${(content || '').slice(0, 500)}`;
    generateEmbedding(textToEmbed)
      .then(emb => {
        if (emb && emb.length) {
          Document.findByIdAndUpdate(doc._id, { embedding: emb }).exec().catch(() => {});
        }
      })
      .catch(embError => {
        console.error('Embedding generation failed (background):', embError);
      });

    res.status(201).json(doc);
  } catch (error) {
    console.error('createDocument error:', error);
    res.status(500).json({ error: 'Server error creating document' });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { title, tags, isPublic } = req.body;

    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const doc = await Document.findOne(filter);
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
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const doc = await Document.findOneAndDelete(filter);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (e) {
        console.error('Failed to unlink file:', e);
      }
    }

    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleShare = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const doc = await Document.findOne(filter);
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
