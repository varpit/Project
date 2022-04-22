const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: [true, 'Policy already exists'],
    required: [true, 'Please add a policy name']
  },
  display_name: {
    type: String,
    trim: true,
    required: [true, 'Please add a display_name']
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Please add policy description']
  },
  active_policy: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Policy', PolicySchema);