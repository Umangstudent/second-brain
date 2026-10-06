const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    default: ''
  },
  originalName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
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

documentSchema.index({ user: 1, tags: 1 });
documentSchema.index({ shareHash: 1 });

module.exports = mongoose.model('Document', documentSchema);
