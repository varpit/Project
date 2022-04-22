const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);


router
  .route('/')
  .get(advancedResults(User), getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;