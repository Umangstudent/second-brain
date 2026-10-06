const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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

noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ shareHash: 1 });

module.exports = mongoose.model('Note', noteSchema);
