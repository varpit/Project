const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title']
  },
  body: {
    type: String,
    trim: true,
    required: [true, 'Please add body of the post']
  },
  status: {
    type: String,
    enum: ['publish', 'hidden'],
    required: [true, 'Please set the status of the post']
  },
  active_post: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);