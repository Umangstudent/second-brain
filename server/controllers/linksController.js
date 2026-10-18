const Link = require('../models/Link');
const { paginate } = require('../utils/pagination');
const { generateEmbedding } = require('../services/embedding');
const { v4: uuidv4 } = require('uuid');

exports.getLinks = async (req, res) => {
  try {
    const { tags, page, limit, sort, all } = req.query;
    const searchTerm = req.query.search || req.query.q;
    const isAdmin = req.user.role === 'admin';
    let query = (isAdmin && all === 'true') ? {} : { user: req.user.id };

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { url: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
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

    const result = await paginate(Link, query, page, limit, sortObj);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getLinkById = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const link = await Link.findOne(filter);
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createLink = async (req, res) => {
  try {
    const { title, url, description, tags, isPublic } = req.body;
    const shareHash = isPublic ? uuidv4() : undefined;

    const link = await Link.create({
      user: req.user.id,
      title,
      url,
      description,
      tags,
      isPublic: !!isPublic,
      shareHash,
      embedding: []
    });

    // Generate embedding in background
    generateEmbedding(`${title} ${description || ''}`)
      .then(emb => {
        if (emb && emb.length) {
          Link.findByIdAndUpdate(link._id, { embedding: emb }).exec().catch(() => {});
        }
      })
      .catch(embError => {
        console.error('Embedding generation failed (background):', embError);
      });

    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateLink = async (req, res) => {
  try {
    const { title, url, description, tags, isPublic } = req.body;
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };

    const link = await Link.findOne(filter);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (title !== undefined) link.title = title;
    if (url !== undefined) link.url = url;
    if (description !== undefined) link.description = description;
    if (tags !== undefined) link.tags = tags;
    
    if (isPublic !== undefined && isPublic !== link.isPublic) {
      link.isPublic = isPublic;
      link.shareHash = isPublic ? uuidv4() : undefined;
    }

    if (title !== undefined || description !== undefined) {
      try {
        const embedding = await generateEmbedding(`${link.title} ${link.description || ''}`);
        if (embedding) link.embedding = embedding;
      } catch (embError) {
        console.error('Embedding generation failed:', embError);
      }
    }

    await link.save();
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const link = await Link.findOneAndDelete(filter);
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json({ message: 'Link removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleShare = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };
    const link = await Link.findOne(filter);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    link.isPublic = !link.isPublic;
    if (link.isPublic) {
      link.shareHash = uuidv4();
    } else {
      link.shareHash = undefined;
    }

    await link.save();
    res.json({ isPublic: link.isPublic, shareHash: link.shareHash });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
