const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Policy = require('../models/Policy');
const Role = require('../models/Roles');

class roleController {
// @desc      Get roles
// @route     GET /role
// @access    Public
getRoles = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const thisUser = await Token.find({token: token});
    const status = thisUser.map((obj) => obj.status);
    const checkPolicy = thisUser.map((obj) => obj.policy_name);
    if(!(checkPolicy[0].includes('get_roles'))) {
        return next(new ErrorResponse(`Unauthorized`, 401));
    }
    if(status[0] === 'loggedOut') {
        return next(new ErrorResponse(`You are logged out`, 401));
    }
    const roles = await Role.find({active_role: true });

    let keys = Object.keys(req.query);

            let filters = new Object();

            if (keys.includes("name")) {
                filters.name = { $regex: req.query["name"], $options: "i" };
            }
            if (keys.includes("display_name")) {
                filters.email = { $regex: req.query["display_name"], $options: "i" };
            }

            if(keys.length > 0){
                const data = await Role.find(filters)
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
      count: roles.length,
      data: roles
    });
  
});

// @desc      Get single role
// @route     GET /role/:id
// @access    Public
getRole = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const thisUser = await Token.find({token: token});
    const status = thisUser.map((obj) => obj.status);
    const checkPolicy = thisUser.map((obj) => obj.policy_name);
    if(!(checkPolicy[0].includes('get_role'))) {
        return next(new ErrorResponse(`Unauthorized`, 401));
    }
    if(status[0] === 'loggedOut') {
        return next(new ErrorResponse(`You are logged out`, 401));
    }
    const role = await Role.findById(req.params.id);

    if (!role || role['active_role'] === false) {
        return next(
        new ErrorResponse(`No role with the id of ${req.params.id}`, 404)
        );
    }

  res.status(200).json({
    success: true,
    data: role
  });
});

// @desc      Add role
// @route     POST /role
// @access    Public
addRole = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const thisUser = await Token.find({token: token});
    const status = thisUser.map((obj) => obj.status);
    const checkPolicy = thisUser.map((obj) => obj.policy_name);
    if(!(checkPolicy[0].includes('create_role'))) {
        return next(new ErrorResponse(`Unauthorized`, 401));
    }
    if(status[0] === 'loggedOut') {
        return next(new ErrorResponse(`You are logged out`, 401));
    }
    var policyId = [];
    if(!('name' in req.body) && !('display_name' in req.body) && !('policy_name' in req.body)) {
        return next(new ErrorResponse(`Please add policy name, Please add a role name, Please add display name`, 400));
    }
    if(!('policy_name' in req.body)){
        return next(new ErrorResponse(`Please add a policy name`, 400));
    }
    await Policy.find({
    name: { $in: req.body.policy_name }
    }).then((policyName) => {
        const pName = req.body.policy_name;
        for(let i = 0 ; i < pName.length ; i++) {
            if(pName.length <= policyName.length){
                policyId.push(policyName[i]._id);
            } else {
                return next(new ErrorResponse(`Kindly check the policy names`, 404));
            }
        }
    });
    req.body.policyId = policyId;
    const data = await Role.create(req.body);
    res.status(201).json({
        success: true,
        data: data
    });

});

// @desc      Update role
// @route     PUT /role/:id
// @access    Public
updateRole = asyncHandler(async (req, res, next) => {const token = req.headers.authorization.split(" ")[1];
const thisUser = await Token.find({token: token});
const status = thisUser.map((obj) => obj.status);
const checkPolicy = thisUser.map((obj) => obj.policy_name);
if(!(checkPolicy[0].includes('update_role'))) {
  return next(new ErrorResponse(`Unauthorized`, 401));
}
if(status[0] === 'loggedOut') {
  return next(new ErrorResponse(`You are logged out`, 401));
}

  let role = await Role.findById(req.params.id);

  if(!role['active_role']) {
      return next(new ErrorResponse(`Role ${req.params.id} not exists`, 404));
  }

  if (!role) {
    return next(
      new ErrorResponse(`No role with the id of ${req.params.id}`, 404)
    );
  }
    var policyId = [];
    const pName = req.body.policy_name;
    if(('policy_name' in req.body) && pName.length == 0) {
        return next(new ErrorResponse(`Policy name cannot be empty`, 400));
    }
        
    if(pName !== undefined) {
    // let outputArray = Array.from(new Set(arr))
        await Policy.find({$and:[{
            name: { $in: req.body.policy_name }
            }, {active_policy: true}]}).then((policyName) => {
                const pName = req.body.policy_name;
                for(let i = 0 ; i < pName.length ; i++) {
                    if(pName.length <= policyName.length){
                        policyId.push(policyName[i]._id);
                    } else {
                        return next(new ErrorResponse(`Kindly check the policy names`, 404));
                    }
                }
            });
        }

    if(policyId.length > 0) {
        role = await Role.findByIdAndUpdate(req.params.id,{policyId: policyId, policy_name: req.body.policy_name},  {
            new: true,
            runValidators: true,
        });
    }
    if(policyId.length === 0) {
        role = await Role.findByIdAndUpdate(req.params.id, req.body,  {
            new: true,
            runValidators: true,
        });
    }
  role.save();

  res.status(200).json({
    success: true,
    data: role
  });
});

// @desc      Delete role
// @route     DELETE /role/:id
// @access    Public
deleteRole = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const thisUser = await Token.find({token: token});
    const status = thisUser.map((obj) => obj.status);
    const checkPolicy = thisUser.map((obj) => obj.policy_name);
    if(!(checkPolicy[0].includes('delete_role'))) {
        return next(new ErrorResponse(`Unauthorized`, 401));
    }
    if(status[0] === 'loggedOut') {
        return next(new ErrorResponse(`You are logged out`, 401));
    }
    const role = await Role.findByIdAndUpdate(req.params.id, {
    active_role: false
    });

    if (!role) {
        return next(
        new ErrorResponse(`No role with the id of ${req.params.id}`, 404)
        );
    }

    await role.save();

    res.status(200).json({
        success: true,
        data: {}
        });
    });
}

module.exports = roleController;