const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: [true, "Role already exists"],
    required: [true, 'Please add a role name']
  },
  display_name: {
    type: String,
    trim: true,
    required: [true, 'Please add a display_name']
  },
  policy_name: [{
    type: String,
    required: [true, 'Please add policy name']
  }],
  policyId: [{
      type: String
  }],
  active_role: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Role', RoleSchema);