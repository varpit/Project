const express = require('express');
const 
  roleController
 = require('../controllers/roleController');

const Policy = require('../models/Policy');
const Role = require('../models/Roles');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const roleObj = new roleController;

router
  .route('/')
  .post(protect, roleObj.addRole).get(protect, roleObj.getRoles);

router.route('/:id').put(protect, roleObj.updateRole).delete(protect, roleObj.deleteRole).get(protect, roleObj.getRole);


module.exports = router;