const { ObjectID } = require('mongodb');
const executeCode = require('../helpers/executeCode');

module.exports = {
	async getTasks(req, res) {
		const { db } = req.app.locals;

		try {
			const tasks = await db
				.collection('tasks')
				.find({})
				.toArray();

			res.status(200).json(tasks);
		} catch (err) {
			// Server error
			res.status(500).send('Error occured while fetching tasks from db');
		}
	},

	async getTaskById(req, res) {
		const { db } = req.app.locals;
		const { id } = req.params;

		try {
			const task = await db
				.collection('tasks')
				.findOne({ _id: new ObjectID(id) });

			if (task) {
				res.status(200).json(task);
			} else {
				res.status(404).send('Resource not found');
			}
		} catch (err) {
			// Server error
			res.status(500).send('Error occured while fetching task from db');
		}
	},

	async deleteTaskById(req, res) {
		const { id } = req.params;
		const { db } = req.app.locals;

		try {
			const task = await db
				.collection('tasks')
				.findOne({ _id: new ObjectID(id) });

			if (task) {
				const users = await db
					.collection('users')
					.find({})
					.toArray();

				users.forEach(user => {
					if (user.completedTasks.includes(id)) {
						const completedTasks = user.completedTasks.filter(
							task => task !== id
						);

						db.collection('users').updateOne(
							{ _id: new ObjectID(user._id) },
							{
								$set: {
									completedTasks: completedTasks
								}
							}
						);
					}
				});

				const deleteRes = await db
					.collection('tasks')
					.deleteOne({ _id: new ObjectID(id) });

				if (deleteRes.deletedCount) {
					res.status(200).send('Resource successfully deleted');
				} else {
					res.status(500).send('Internal server error');
				}
			} else {
				res.status(404).send('Resource not found');
			}
		} catch (err) {
			res.status(500).send('Internal server error');
		}
	},

	async createTask(req, res) {
		const { db } = req.app.locals;
		const { title, description, difficulty, solution, codeSnippet } = req.body;

		// Validation
		const errors = {};

		if (!title) errors.title = 'Заголовок задания не может быть пустым';
		if (!description)
			errors.description = 'Описание задания не может быть пустым';
		if (parseInt(difficulty) > 10 || parseInt(difficulty) < 1)
			errors.difficulty =
				'Сложность задания должна быть в интервале от 1 до 10 (включительно)';
		if (!difficulty)
			errors.difficulty = 'У задания должна быть задана сложность';
		if (!solution) errors.solution = 'Ответ задания не может быть пустым';

		if (!Object.keys(errors).length) {
			// No errors
			const task = {
				title,
				description,
				difficulty,
				solution,
				codeSnippet,
				createdAt: new Date()
			};

			try {
				const insertRes = await db.collection('tasks').insertOne(task);

				if (insertRes.insertedCount) {
					const id = insertRes.insertedId;

					res.status(200).json(task);
				} else {
					res.status(500).send('Error occured while inserting new document');
				}
			} catch (err) {
				res.status(500).send('Error occured while inserting new document');
			}
		} else {
			res.status(400).json(errors);
		}
	},

	checkTask(req, res) {
		const { code, id } = req.body;
		const { db } = req.app.locals;
		const { decoded } = req;

		db.collection('tasks')
			.findOne({ _id: new ObjectID(id) })
			.then(task => {
				if (!task) {
					return res.status(404).send('Task not found');
				}

				executeCode(code, function(err, data) {
					let check = false;

					if (!err) {
						if (typeof task.solution === 'object') {
							// Task solution check for arrays
							let dataArr = data.replace(/\[|\]|\s|'/g, '').split(',');
							userSolutionString = JSON.stringify(dataArr);

							const taskSolutionString = JSON.stringify(task.solution);

							check = userSolutionString === taskSolutionString;
						} else {
							// Task solution for strings
							let userSolution = data.replace(/\n/, '').replace(/\r/, '');

							check = userSolution === task.solution;
						}
					}

					if (check) {
						db.collection('users')
							.findOne({ _id: new ObjectID(decoded.id) })
							.then(user => {
								if (!user) {
									res.status(400).send('User not found');
								} else {
									// Check if tasks is already in the array
									if (!user.completedTasks.includes(id)) {
										db.collection('users').updateOne(
											{ _id: new ObjectID(decoded.id) },
											{
												$push: {
													completedTasks: id
												}
											}
										);
									}
								}
							});
					}

					res.status(200).json({ err, data, check });
				});
			})
			.catch(err => res.status(500).send('Internal server error'));
	}
};
