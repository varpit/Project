const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const Token = require('../models/Token');
const Policy = require('../models/Policy');
const Role = require('../models/Roles');
const jwt = require('jsonwebtoken');

// @desc      Register user
// @route     POST /auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const checkForUsers = await User.find({});
  const getRoleId = await Role.find({name: 'user'});
  const userRoleId = getRoleId.map((obj) => obj._id);
  const { name, email, password, type, roleId = userRoleId[0] } = req.body;
  if( checkForUsers.length === 0) {
    return next(new ErrorResponse(`URL not found`, 404));
  }
  if(!((req.body.type) === undefined) && !(req.body.type === 'user')) {
    return next(new ErrorResponse(`Unauthorized to create user of type ${req.body.type}`, 403));
  }
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    type,
    roleId
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Register user
// @route     POST /auth/register/user
// @access    Private
exports.registerUser = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  var { name, email, password, type} = req.body;
  
  const emptyBody = Object.keys(req.body).length;
  if(emptyBody === 0) {
    return next(new ErrorResponse(`Please add name, email, password and type`, 400));
  }
  if(!("name" in req.body)){
    return next(new ErrorResponse(`Please add name`, 400));
  }
  if(!("email" in req.body)){
    return next(new ErrorResponse(`Please add email`, 400));
  }
  if(!("password" in req.body)){
    return next(new ErrorResponse(`Please add password`, 400));
  }
  if(!("type" in req.body)){
    return next(new ErrorResponse(`Please add type`, 400));
  }
  if((req.body.type === 'user') && !(checkPolicy[0].includes('create_user'))) {
    return next(new ErrorResponse(`You are not authorized to create ${req.body.type}`,401));
  }
  if((req.body.type === 'admin') && !(checkPolicy[0].includes('create_admin'))) {
    return next(new ErrorResponse(`You are not authorized to create ${req.body.type}`,401));
  }
  if((req.body.type === 'super_admin') && !(checkPolicy[0].includes('create_super-admin'))) {
    return next(new ErrorResponse(`You are not authorized to create ${req.body.type}`,401));
  }
      const getRoleId = await Role.find({name: req.body.type});
      const userRoleId = getRoleId.map((obj) => obj._id);
      var {roleId = userRoleId[0]} = req.body;
      // Create user
      const user = await User.create({
        name,
        email,
        password,
        type,
        roleId
      });
      return sendTokenResponse(user, 200, res);
});

// @desc      Register SuperAdmin
// @route     POST /auth/super
// @access    Public
exports.createSuperAdmin = asyncHandler(async (req, res, next) => {
  const checkForUsers = await User.find({});
  if(checkForUsers.length === 0) {
    if(req.body === undefined) {
      return next(new ErrorResponse(`Please add name, email and password`, 400));
    }
    const policies = [
      {
        name: 'create_admin',
        display_name: 'Create Admin',
        description: 'This user is permitted to create admin'
      },
      {
        name: 'create_super-admin',
        display_name: 'Create SuperAdmin',
        description: 'This user is permitted to create super-admin'
      },
      {
        name: 'create_user',
        display_name: 'Create User',
        description: 'This user is permitted to create user'
      },
      {
        name: 'update_user',
        display_name: 'Update User',
        description: 'This user is permitted to update user'
      }
      ,
      {
        name: 'update_self',
        display_name: 'Update Self',
        description: 'This user is permitted to update self'
      },
      {
        name: 'update_password',
        display_name: 'Update Password',
        description: 'This user is permitted to update own password'
      },
      {
        name: 'delete_user',
        display_name: 'Delete User',
        description: 'This user is permitted to Delete User'
      },
      {
        name: 'delete_self',
        display_name: 'Delete Self',
        description: 'This user is permitted to Delete Self'
      },
      {
        name: 'get_user',
        display_name: 'Get User',
        description: 'This user is permitted to search a single user'
      },
      {
        name: 'get_users',
        display_name: 'Get Users',
        description: 'This user is permitted to get records of all users'
      },
      {
        name: 'get_me',
        display_name: 'Get Me',
        description: 'This user is permitted to get own profile'
      },
      {
        name: 'create_policy',
        display_name: 'Create Policy',
        description: 'This user is permitted to create policy'
      },
      {
        name: 'update_policy',
        display_name: 'Update Policy',
        description: 'This user is permitted to update policy'
      },
      {
        name: 'delete_policy',
        display_name: 'Delete Policy',
        description: 'This user is permitted to delete policy'
      },
      {
        name: 'get_policy',
        display_name: 'Get Policy',
        description: 'This user is permitted to get a single policy'
      },
      {
        name: 'get_policies',
        display_name: 'Get Policies',
        description: 'This user is permitted to get records of all policies'
      },
      {
        name: 'create_role',
        display_name: 'Create Role',
        description: 'This user is permitted to create role'
      },
      {
        name: 'update_role',
        display_name: 'Update Role',
        description: 'This user is permitted to update role'
      },
      {
        name: 'delete_role',
        display_name: 'Delete Role',
        description: 'This user is permitted to delete role'
      },
      {
        name: 'get_role',
        display_name: 'Create Admin',
        description: 'This user is permitted to get a single role'
      },
      {
        name: 'get_roles',
        display_name: 'Get Roles',
        description: 'This user is permitted to get records of all roles'
      },
      {
        name: 'create_post',
        display_name: 'Create Post',
        description: 'This user is permitted to create post'
      },
      {
        name: 'update_post',
        display_name: 'Update Post',
        description: 'This user is permitted to update post'
      },
      {
        name: 'delete_post',
        display_name: 'Delete Post',
        description: 'This user is permitted to delete post'
      },
      {
        name: 'get_post',
        display_name: 'Get Post',
        description: 'This user is permitted to get a single post'
      },
      {
        name: 'get_posts',
        display_name: 'Get Posts',
        description: 'This user is permitted to get records of all posts'
      }
    ]
    const superAdminPolicy = await Policy.create(policies);
    const superAdminPolicies = ['create_admin', 'create_super-admin','create_user', 'update_user', 'update_self', 'update_password', 'delete_user'
      , 'delete_self', 'get_user', 'get_users', 'get_me', 'create_policy', 'update_policy', 'delete_policy', 'get_policy', 'get_policies'
      , 'create_role', 'update_role', 'delete_role', 'get_role', 'get_roles', 'create_post', 'update_post', 'update_mypost'
      , 'delete_mypost', 'delete_post', 'get_post', 'get_posts']
    const adminPolicies = ['create_admin', 'create_user', 'update_user', 'update_password', 'update_self', 'delete_user', 'delete_self', 'get_user'
    , 'get_users', 'get_me', 'create_policy', 'update_policy', 'delete_policy', 'get_policy', 'get_policies'
    , 'create_post', 'update_post', 'delete_post', 'update_mypost', 'delete_mypost', 'get_post', 'get_posts']
    const userPolicies = ['create_user', 'update_password', 'update_self', 'delete_self', 'get_user', 'get_me', 'create_post', 'update_mypost'
    , 'delete_mypost', 'get_post', 'get_posts']
    req.body.policy_name = superAdminPolicies;

    var superAdminPolicyId = [];
    await Policy.find({
      name: { $in: req.body.policy_name }
      }).then((policyName) => {
          for(let i = 0 ; i < policyName.length ; i++) {
                  superAdminPolicyId.push(policyName[i]._id);
          }
      });
    var adminPolicyId = [];
    await Policy.find({
      name: { $in: adminPolicies }
      }).then((policyName) => {
          for(let i = 0 ; i < policyName.length ; i++) {
                  adminPolicyId.push(policyName[i]._id);
          }
      });
    var userPolicyId = [];
    await Policy.find({
      name: { $in: userPolicies }
      }).then((policyName) => {
          for(let i = 0 ; i < policyName.length ; i++) {
                  userPolicyId.push(policyName[i]._id);
          }
      });

    const createRoles = [{
      name: 'super_admin',
      display_name: 'Super Admin',
      policy_name: superAdminPolicies,
      policyId: superAdminPolicyId
    },
    {
      name: 'admin',
      display_name: 'Admin',
      policy_name: adminPolicies,
      policyId: adminPolicyId
    },
    {
      name: 'user',
      display_name: 'User',
      policy_name: userPolicies,
      policyId: userPolicyId
    }];
    const superAdminRole = await Role.create(createRoles);
    const getSuperAdminId = await Role.find({name: 'super_admin'});
    const superAdminId = getSuperAdminId.map((obj) => obj._id);
    const { name, email, password, type = 'super_admin', roleId = superAdminId[0]} = req.body;
    if(!((req.body.type) === undefined) && !(req.body.type === 'super_admin')) {
      return next(new ErrorResponse(`First user cannot be ${req.body.type}`, 403));
    }
    const user = await User.create({
      name,
      email,
      password,
      type,
      roleId
    });
     return sendTokenResponse(user, 201, res);
  }

  return next(new ErrorResponse(`URL not found`, 404));
})


// @desc      Register SuperAdmin
// @route     POST /auth/super
// @access    Private
// exports.createAnotherSuperAdmin = asyncHandler(async (req, res, next) => {
//   const thisUser = await User.find({_id: req.user.id});
//   const checkForSuperAdmin = thisUser.map((obj) => obj.role);
//   if(!(checkForSuperAdmin[0] === 'super_admin')) {
//     return next(new ErrorResponse(`Unauthorized`, 401));
//   }
//   const getSuperAdminId = await Role.find({name: 'super_admin'});
//     const superAdminId = getSuperAdminId.map((obj) => obj._id);
//     console.log(superAdminId);
//     const { name, email, password, role = 'super_admin', roleId = superAdminId[0]} = req.body;
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//       roleId
//     });
//      sendTokenResponse(user, 201, res);
// })

// @desc      Login user
// @route     POST /auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  const activeUser = user['active_user'];

  if(!activeUser) {
    return next(new ErrorResponse(`User ${req.body.email} not exists`, 404));
  }

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are already logged out`, 400));
  }
  const id = await Token.find({user: req.user.id});
  const ids = id.map((obj) => obj._id);
  
  const logout = await Token.findByIdAndUpdate(ids, {
    status: 'loggedOut'
  });

  await logout.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('get_me'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
// exports.updateDetails = asyncHandler(async (req, res, next) => {
//   const fieldsToUpdate = {
//     name: req.body.name,
//     email: req.body.email
//   };
//   const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
//     new: true,
//     runValidators: true
//   });
//   res.status(200).json({
//     success: true,
//     data: user
//   });
// });

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const thisUser = await Token.find({token: token});
  const status = thisUser.map((obj) => obj.status);
  const checkPolicy = thisUser.map((obj) => obj.policy_name);
  if(!(checkPolicy[0].includes('update_password'))) {
    return next(new ErrorResponse(`Unauthorized`, 401));
  }
  if(status[0] === 'loggedOut') {
    return next(new ErrorResponse(`You are logged out`, 401));
  }
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// // @desc      Forgot password
// // @route     POST /api/v1/auth/forgotpassword
// // @access    Public
// exports.forgotPassword = asyncHandler(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new ErrorResponse('There is no user with that email', 404));
//   }

//   // Get reset token
//   const resetToken = user.getResetPasswordToken();

//   await user.save({ validateBeforeSave: false });

//   // Create reset url
//   const resetUrl = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/auth/resetpassword/${resetToken}`;

//   const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Password reset token',
//       message
//     });

//     res.status(200).json({ success: true, data: 'Email sent' });
//   } catch (err) {
//     console.log(err);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save({ validateBeforeSave: false });

//     return next(new ErrorResponse('Email could not be sent', 500));
//   }
// });

// // @desc      Reset password
// // @route     PUT /api/v1/auth/resetpassword/:resettoken
// // @access    Public
// exports.resetPassword = asyncHandler(async (req, res, next) => {
//   // Get hashed token
//   const resetPasswordToken = crypto
//     .createHash('sha256')
//     .update(req.params.resettoken)
//     .digest('hex');

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() }
//   });

//   if (!user) {
//     return next(new ErrorResponse('Invalid token', 400));
//   }

//   // Set new password
//   user.password = req.body.password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;
//   await user.save();

//   sendTokenResponse(user, 200, res);
// });

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const decoded = jwt.verify(token, process.env.JWT_SECRET); 

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  const getRole = await User.find({_id: decoded.id});
  const thisRole = getRole.map((obj) => obj.type);
  const policyName = await Role.find({name: thisRole});
  const rolePolicies = policyName.map((obj) => obj.policy_name);
  const rolePolicyId = policyName.map((obj) => obj.policyId);

  const tokenObj = {
    token: token,
    status: 'active',
    user: decoded.id,
    policy_name: rolePolicies[0],
    policyId: rolePolicyId[0],
    expiry_time: new Date(Date.now() + 1 * 60 * 60 * 1000)
  }

  const data = await Token.create(tokenObj);

  res
    .status(statusCode)
    .json({
      success: true,
      token
    });
};