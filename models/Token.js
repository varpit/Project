const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  status: {
    type: String,
    default: 'active'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  policyId: [{
    type: String
  }],
  policy_name: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiry_time: {
    type: Date,
  }
},
{
    timestamps: true
});
// TokenSchema.index({ "expiry_time": new Date(Date.now() + 1 * 1000)}, { expireAfterSeconds: 1 } );
module.exports = mongoose.model('Token', TokenSchema);