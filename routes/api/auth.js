const { Router } = require('express');
const {
	register,
	login,
	currentUser,
	logout,
	registerStuff
} = require('../../controllers/auth');

const withAuth = require('../../utils/withAuth');
const stuffRequired = require('../../utils/stuffRequired');

const router = Router();

// @route
// @public
// Register a user
router.post('/register', register);

// @route
// @private stuff-only
// Register a stuff user
router.post('/stuff/register', withAuth, stuffRequired, registerStuff);

// @route
// @public
// Login a user
router.post('/login', login);

// @route
// @private user-only
// Get user data from token
router.get('/current', withAuth, currentUser);

// @route
// @private user-only
// Logout user with valid token
router.post('/logout', withAuth, logout);

module.exports = router;
