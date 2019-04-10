const bcrypt = require('bcryptjs');

class User {
	constructor(name, email, password, status = 'user') {
		this.name = name;
		this.email = email;
		this.password = password;
		this.status = status;
	}

	async hashPassword() {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(this.password, salt);

		this.password = hash;
	}

	async save(db) {
		const { name, email, password, status } = this;
		const completedTasks = [];

		const res = await db
			.collection('users')
			.insertOne({ name, email, password, status, completedTasks });

		return res;
	}

	static async checkUser(email, password, db) {
		let error = '';
		let resStatus;

		// Get user by email
		try {
			const user = await db.collection('users').findOne({ email });

			if (user) {
				// User exists - check password
				const match = await bcrypt.compare(password, user.password);

				if (match) {
					// Passwords match
					return [true, null, 200];
				} else {
					error = 'Неверные данные авторизации';
					resStatus = 400;
				}
			} else {
				// No user
				error = 'Неверные данные авторизации';
				resStatus = 400;
			}
		} catch (err) {
			// Server error
			error = 'Произошла ошибка на стороне сервера';
			resStatus = 500;
		}

		return [false, error, resStatus];
	}

	static async getUserByEmail(email, db) {
		const user = await db.collection('users').findOne({ email });
		return user;
	}
}

module.exports = User;
