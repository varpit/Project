const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const postObj = new postController;

router
  .route('/')
  .post(protect, postObj.addPost).get(postObj.getPosts);

router.route('/:id').put(protect, postObj.updatePost).delete(protect, postObj.deletePost).get(protect,  postObj.getPost);


module.exports = router;