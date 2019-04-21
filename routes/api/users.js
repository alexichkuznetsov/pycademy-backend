const { Router } = require('express');
const withAuth = require('../../utils/withAuth');
const { getProfile } = require('../../controllers/users');

const router = Router();

router.get('/profile', withAuth, getProfile);

module.exports = router;
