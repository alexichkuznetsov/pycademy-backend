const jwt = require('jsonwebtoken');
const User = require('../../models/User');

module.exports = {
	async register(req, res) {
		const { name, email, password, confirmPassword } = req.body;
		const errors = {};

		if (!name) errors.name = 'Имя пользователя не может быть пустым';
		if (!email) errors.email = 'Адрес электронной почты не может быть пустым';
		if (!password) errors.password = 'Пароль не может быть пустым';
		if (!confirmPassword)
			errors.confirmPassword = 'Подтверждение пароля не может быть пустым';
		if (password !== confirmPassword)
			errors.confirmPassword = 'Введенные пароли не совпадают';

		// Check if any errors
		if (!Object.keys(errors).length) {
			// No errors
			const { db } = req.app.locals;

			try {
				const user = await db.collection('users').findOne({ email });

				if (!user) {
					const user = new User(name, email, password);
					await user.hashPassword();

					const insertRes = await user.save(db);

					if (insertRes.insertedCount) {
						res.status(201).json({ msg: 'Вы успешно зарегистрировались' });
					} else {
						res
							.status(500)
							.json({ msg: 'Произошла ошибка во время записи в базу данных' });
					}
				} else {
					res.status(400).json({
						msg: 'Пользователь с таким электронным адресом уже зарегистрирован'
					});
				}
			} catch (err) {
				// Internal errors
				console.log(err);
				res
					.status(500)
					.json({ msg: 'Ошибка на стороне сервера. Попробуйте позже' });
			}
		} else {
			res.status(400).json(errors);
		}
	},

	async login(req, res) {
		const { email, password } = req.body;
		const { db } = req.app.locals;
		const [check, errors] = await User.checkUser(email, password, db);

		if (check) {
			// Correct credentials
			const { _id, name, status, completedTasks } = await User.getUserByEmail(
				email,
				db
			);

			const payload = { id: _id, name, email, status, completedTasks };
			const token = jwt.sign(payload, process.env.SECRET, { expiresIn: 30 });

			res
				.cookie('token', token, { httpOnly: true })
				.status(200)
				.json({ msg: 'Авторизация прошла успешно' });
		} else {
			// Incorrect credentials
			res.status(400).json(errors);
		}
	},

	async currentUser(req, res) {
		const { decoded } = req;

		res.status(200).json(decoded);
	}
};
