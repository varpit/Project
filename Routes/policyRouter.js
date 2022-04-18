const express = require('express');
const router = express.Router();
const {
    createPolicy
} = require('../Controllers/policyController');

router.route('/policy').post(createPolicy);

module.exports = router;
