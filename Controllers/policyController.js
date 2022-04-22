const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Policy = require('../models/Policy');

// @desc      Get policies
// @route     GET /policy
// @access    Private
exports.getPolicies = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('get_policies'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
    const policies = await Policy.find({active_policy: true });

    let keys = Object.keys(req.query);

            let filters = new Object();

            if (keys.includes("name")) {
                filters.name = { $regex: req.query["name"], $options: "i" };
            }
            if (keys.includes("display_name")) {
                filters.email = { $regex: req.query["display_name"], $options: "i" };
            }

            if(keys.length > 0) {
              const data = await Policy.find(filters)
                if (data.length == 0) {
                    return next(new ErrorResponse(`No role with such query`, 404));
                }
                return res.status(200).json({
                  success: true,
                  count: data.length,
                  data: data
                });
            }
            

    return res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  
});

// @desc      Get single policy
// @route     GET /policy/:id
// @access    Public
exports.getPolicy = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('get_policy'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const policy = await Policy.findById(req.params.id);

  if (!policy || policy['active_policy'] === false) {
    return next(
      new ErrorResponse(`No policy with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc      Add policy
// @route     POST /policy
// @access    Public
exports.addPolicy = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('create_policy'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const policy = await Policy.create(req.body);

  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc      Update policy
// @route     PUT /policy/:id
// @access    Public
exports.updatePolicy = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('update_policy'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  let policy = await Policy.findById(req.params.id);

  if(!policy['active_policy']) {
    return next(new ErrorResponse(`Policy ${req.params.id} not exists`, 404));
  }

  if (!policy) {
    return next(
      new ErrorResponse(`No policy with the id of ${req.params.id}`, 404)
    );
  }

  policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  policy.save();

  res.status(200).json({
    success: true,
    data: policy
  });
});

// @desc      Delete policy
// @route     DELETE /policy/:id
// @access    Public
exports.deletePolicy = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('delete_policy'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  policy = await Policy.findByIdAndUpdate(req.params.id, {
    active_policy: false
  });

  if (!policy) {
    return next(
      new ErrorResponse(`No policy with the id of ${req.params.id}`, 404)
    );
  }

  await policy.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});