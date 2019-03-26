const jwt = require('jsonwebtoken');

function withAuth(req, res, next) {
	// Get token from cookies
	const token = req.cookies.token;

	if (!token) {
		// No token provided
		res.status(401).json({ msg: 'Unauthorized: no token provided' });
	} else {
		// Check if token is valid
		jwt.verify(token, process.env.SECRET, { expiresIn: '1d' }, function(
			err,
			decoded
		) {
			if (err) {
				// Token expired or invalid
				res.status(401).json({ msg: 'Unauthorized: invalid token' });
			} else {
				// Set decoded data to req object
				req.decoded = decoded;
				next();
			}
		});
	}
}

module.exports = withAuth;
