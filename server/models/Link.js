const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: {
    type: [String]
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareHash: {
    type: String,
    unique: true,
    sparse: true
  },
  embedding: {
    type: [Number]
  }
}, {
  timestamps: true
});

linkSchema.index({ user: 1, tags: 1 });
linkSchema.index({ shareHash: 1 });

module.exports = mongoose.model('Link', linkSchema);
