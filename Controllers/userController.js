const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Token = require('../models/Token');

// @desc      Get all users
// @route     GET /users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('get_users'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /users/:id
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('get_user'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update user
// @route     PUT /users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('update_self'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (req.params.id.toString() !== req.user.id && !(checkPolicy[0].includes('update_user'))) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update ${user._id}`,
        401
      )
    );
  }

  await user.save();
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('delete_self'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  if(status[0] === 'user_deleted') {
    return next(new ErrorResponse(`User not exists`, 404));
  }
  if (req.params.id.toString() !== req.user.id && !(checkPolicy[0].includes('delete_user')) ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete ${req.params.id}`,
        401
      )
    );
  }
  const currUser = await User.findByIdAndUpdate(req.params.id, {
    active_user: false
  });
  const id = await Token.find({user: req.user.id});
  const ids = id.map((obj) => obj._id);
  
  const del = await Token.findByIdAndUpdate(ids, {
    status: 'user_deleted'
  });
  

  await del.save();
  await currUser.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});