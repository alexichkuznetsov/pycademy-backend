const { spawn } = require('child_process');

function executeCode(code, cb) {
	const process = spawn('python', ['script.py', code]);

	process.stdout.on('data', data => {
		cb(null, data.toString());
	});

	process.stderr.on('data', err => {
		cb(err.toString());
	});
}

module.exports = executeCode;
