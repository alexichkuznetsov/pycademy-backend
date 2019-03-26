const { Router } = require('express');
const { register, login, currentUser } = require('../../controllers/auth');

const withAuth = require('../../utils/withAuth');

const router = Router();

// @route
// @public
// Register a user
router.post('/register', register);

// @route
// @public
// Login a user
router.post('/login', login);

// @route
// @private
// Get user data from token
router.get('/current', withAuth, currentUser);

module.exports = router;
