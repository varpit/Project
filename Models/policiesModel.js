const mongoose = require("mongoose");

var policySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Pleas enter a valid policy name'],
      unique: true
    },
    display_name: {
      type: String,
      trim: true,
      required: [true, 'Please enter a valid display name'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please enter a vaild description'],
      minlength: [3, 'Description can not be less than of 3 characters'],
      maxlength: [500, 'Description can not be of more than 500 characters']
    },
    active_policy: {
      type: String,
      default: "Yes"
    }
  },
  {
    timestamps: true,
  }
);

var Policy = mongoose.model('Policy' , policySchema);

module.exports = Policy;


