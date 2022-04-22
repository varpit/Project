const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Post = require('../models/Post');
const User = require('../models/User');
const Token = require('../models/Token');

class postController {
// @desc      Get posts
// @route     GET /posts
// @access    Public
getPosts = asyncHandler(async (req, res, next) => {
    const posts = await Post.find({ $and:
      [
        { active_post: true },
        { status: 'publish'}
      ]});

    let keys = Object.keys(req.query);

            let filters = new Object();

            if (keys.includes("title")) {
                filters.title = { $regex: req.query["title"], $options: "i" };
            }
            if (keys.includes("body")) {
                filters.body = { $regex: req.query["body"], $options: "i" };
            }

            if(keys.length > 0) {
              const data = await Policy.find(filters)
                if (data.length == 0) {
                    return next(new ErrorResponse(`No post with such query`, 404));
                }
                return res.status(200).json({
                  success: true,
                  count: data.length,
                  data: data
                });
            }
            

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  
});

// @desc      Get single post
// @route     GET /post/:id
// @access    Public
// const post = await Post.find({user: req.params.id, 
//   user: {$ne: req.params.id},
//   status: "publish"});
getPost = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('get_post'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const post = await Post.find({user: req.params.id});
  const publicPost = await Post.find({$and: [
    {user: {$ne: req.params.id}},
    {status: "publish"}
  ]});

  if (!post || post['active_post'] === false) {
    return next(
      new ErrorResponse(`No post with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: post,
    public: publicPost
  });
});

// @desc      Add post
// @route     POST /post
// @access    Private
addPost = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('create_post'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  req.body.user = req.user.id;
  const user = await User.find({_id: req.user.id});
  const activeUser = user.map((obj) => obj.active_user);
  if(!activeUser[0]) {
    return next(new ErrorResponse(`User ${req.user.id} not exists`, 400));
  }
  const post = await Post.create(req.body);

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc      Update post
// @route     PUT /post/:id
// @access    Public
updatePost = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('update_mypost'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  let post = await Post.findById(req.params.id);
  const user = await User.find({_id: req.user.id});
  const activeUser = user.map((obj) => obj.active_user);
  if(!activeUser[0]) {
    return next(new ErrorResponse(`User ${req.user.id} not exists`, 400));
  }
  if (!post) {
    return next(
      new ErrorResponse(`No post with the id of ${req.params.id}`, 404)
    );
  }

  // // Make sure user is course owner
  if (req.params.id.toString() !== req.user.id && !(checkPolicy[0].includes('update_post'))) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update post ${course._id}`,
        401
      )
    );
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc      Delete post
// @route     DELETE /post/:id
// @access    Public
deletePost = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('delete_mypost'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
    const post = await Post.findByIdAndUpdate(req.params.id, {
    active_post: false
  });
  const user = await User.find({_id: req.user.id});
  const activeUser = user.map((obj) => obj.active_user);
  if(!activeUser[0]) {
    return next(new ErrorResponse(`User ${req.user.id} not exists`, 400));
  }
  if (req.params.id.toString() !== req.user.id && !(checkPolicy[0].includes('update_post'))) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete post ${course._id}`,
        401
      )
    );
  }
  if (!post) {
    return next(
      new ErrorResponse(`No post with the id of ${req.params.id}`, 404)
    );
  }
  await post.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
}

module.exports = postController;