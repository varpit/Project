const express = require('express');
const {
  addPolicy,
  updatePolicy,
  deletePolicy,
  getPolicy,
  getPolicies
} = require('../controllers/policyController');

const Policy = require('../models/Policy');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, addPolicy).get(protect, getPolicies);

router.route('/:id').put(protect, updatePolicy).delete(protect, deletePolicy).get(protect, getPolicy);


module.exports = router;