module.exports = (solution, data) => {
	let check = false;

	if (typeof solution === 'object') {
		// Task solution check for arrays
		let dataArr = data.replace(/\[|\]|\s|'/g, '').split(',');
		userSolutionString = JSON.stringify(dataArr);

		const taskSolutionString = JSON.stringify(solution).replace(/\s/g, '');

		check = userSolutionString === taskSolutionString;
	} else {
		// Task solution for strings
		let userSolution = data.replace(/\n/, '').replace(/\r/, '');

		check = userSolution === solution;
	}

	return check;
};
