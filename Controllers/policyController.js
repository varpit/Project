const Policy = require('../Models/policiesModel');

// @desc   Create policy
// @route  POST/policy 
// @access Public
exports.createPolicy = async (req, res, next) => {
    try {
        const policy = await Policy.create(req.body);

        res.status(201).json({
            success: true,
            data: policy
        });
    } catch(err) {
        res.status(400).json({ success: false });
        console.error(err);
    }
}
