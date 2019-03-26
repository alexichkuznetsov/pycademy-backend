const bcrypt = require('bcryptjs');

class User {
	constructor(name, email, password) {
		this.name = name;
		this.email = email;
		this.password = password;
	}

	async hashPassword() {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(this.password, salt);

		this.password = hash;
	}

	async save(db) {
		const { name, email, password } = this;
		const status = 'user',
			completedTasks = [];

		const res = await db
			.collection('users')
			.insertOne({ name, email, password, status, completedTasks });

		return res;
	}

	static async checkUser(email, password, db) {
		const errors = {};

		// Get user by email
		try {
			const user = await db.collection('users').findOne({ email });

			if (user) {
				// User exists - check password
				const match = await bcrypt.compare(password, user.password);

				if (match) {
					// Passwords match
					return [true, null];
				} else {
					errors.msg = 'Неверные данные авторизации';
				}
			} else {
				// No user
				errors.msg = 'Неверные данные авторизации';
			}
		} catch (err) {
			// Server error
			errors.msg = 'Произошла ошибка во время проверки пользователя';
		}

		return [false, errors];
	}

	static async getUserByEmail(email, db) {
		const user = await db.collection('users').findOne({ email });
		return user;
	}
}

module.exports = User;
