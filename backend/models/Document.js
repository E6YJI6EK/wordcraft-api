const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название документа обязательно'],
    trim: true
  },
  type: {
    type: String,
    enum: ['coursework', 'thesis', 'report', 'essay'],
    required: [true, 'Тип документа обязателен']
  },
  content: {
    type: String,
    default: ''
  },
  gostFormat: {
    type: String,
    enum: ['gost-7.32-2017', 'gost-7.1-2003', 'gost-2.105-95'],
    default: 'gost-7.32-2017'
  },
  settings: {
    fontSize: {
      type: Number,
      default: 14
    },
    lineSpacing: {
      type: Number,
      default: 1.5
    },
    margins: {
      top: { type: Number, default: 20 },
      bottom: { type: Number, default: 20 },
      left: { type: Number, default: 30 },
      right: { type: Number, default: 15 }
    },
    fontFamily: {
      type: String,
      default: 'Times New Roman'
    }
  },
  metadata: {
    author: String,
    supervisor: String,
    department: String,
    year: Number,
    subject: String,
    keywords: [String]
  },
  originalFile: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ title: 'text', 'metadata.subject': 'text' });

module.exports = mongoose.model('Document', documentSchema); 