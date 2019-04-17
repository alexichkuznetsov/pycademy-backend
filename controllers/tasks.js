const { ObjectID } = require('mongodb');
const executeCode = require('../helpers/executeCode');
const checkTask = require('../helpers/checkTask');

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
		const {
			title,
			description,
			difficulty,
			solution,
			mainURL,
			codeSnippet,
			additionalSolution,
			additionalURL
		} = req.body;

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
		if (!mainURL)
			errors.mainURL = 'Ссылка для решения задания не может быть пустой';
		if (!additionalSolution)
			errors.additionalSolution =
				'У задания должна быть дополнительная проверка';
		if (!additionalURL)
			errors.additionalURL =
				'У задания должен быть URL для дополнительной проверки';

		if (!Object.keys(errors).length) {
			// No errors
			const task = {
				title,
				description,
				difficulty,
				solution,
				mainURL,
				codeSnippet,
				additionalSolution,
				additionalURL,
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

	runCode(req, res) {
		const { code } = req.body;

		executeCode(code, (err, data) => res.status(200).json({ err, data }));
	},

	async checkTask(req, res) {
		const { code, id } = req.body;
		const { db } = req.app.locals;
		const { decoded } = req;

		// Get task from db
		const task = await db
			.collection('tasks')
			.findOne({ _id: new ObjectID(id) });

		if (!task) {
			return res.status(404).send('Task not found');
		}

		const codeForAdditionalCheck = code.replace(
			/url\s?=\s?'.*'/,
			`url = '${task.additionalURL}'`
		);

		// Execute user code
		executeCode(code, (err, data) => {
			let check = false;

			if (err) {
				return res
					.status(200)
					.json({ check: false, msg: 'Задание выполнено неверно' });
			} else {
				check = checkTask(task.solution, data);
			}

			// Execute user code for an additional check
			executeCode(
				codeForAdditionalCheck,
				async (additionalCheckError, additionalCheckCodeResult) => {
					let additionalCheck = false;

					if (additionalCheckError) {
						return res
							.status(200)
							.json({ check: false, msg: 'Задание выполнено неверно' });
					} else {
						additionalCheck = checkTask(
							task.additionalSolution,
							additionalCheckCodeResult
						);
					}

					// If task is correct
					if (check && additionalCheck) {
						const user = await db
							.collection('users')
							.findOne({ _id: new ObjectID(decoded.id) });

						if (!user) {
							return res.status(404).send('User not found');
						} else {
							// Check if task is already in completed tasks
							if (!user.completedTasks.includes(id)) {
								await db.collection('users').updateOne(
									{ _id: new ObjectID(decoded.id) },
									{
										$push: {
											completedTasks: id
										}
									}
								);
							}
							return res
								.status(200)
								.json({ check: true, msg: 'Задание выполнено успешно' });
						}
					} else {
						return res
							.status(200)
							.json({ check: false, msg: 'Задание выполнено неверно' });
					}
				}
			);
		});
	}
};
