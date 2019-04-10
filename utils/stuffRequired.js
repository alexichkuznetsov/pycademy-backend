function stuffRequired(req, res, next) {
	const user = req.decoded;

	if (user.status === 'stuff') {
		next();
	} else {
		res.status(403).send('Access forbidden');
	}
}

module.exports = stuffRequired;
