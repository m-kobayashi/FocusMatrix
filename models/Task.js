const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  importance: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  urgency: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  dueDate: Date,
  completed: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  color: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);