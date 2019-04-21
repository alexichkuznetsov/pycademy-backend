const { ObjectID } = require('mongodb');
const asyncForeach = require('../utils/asyncForeach');

module.exports = {
	async getProfile(req, res) {
		const userId = req.decoded.id;
		const { db } = req.app.locals;

		try {
			const user = await db
				.collection('users')
				.findOne({ _id: new ObjectID(userId) });

			const completedTasksCount = user.completedTasks.length;
			const tasks = [];

			await asyncForeach(user.completedTasks, async task => {
				const fetchedTask = await db
					.collection('tasks')
					.findOne({ _id: new ObjectID(task) });
				tasks.push({ id: fetchedTask._id, title: fetchedTask.title });
			});

			res.status(200).json({ tasks: tasks.reverse(), completedTasksCount });
		} catch (err) {
			res.status(200).send('Internal server error');
		}
	}
};
