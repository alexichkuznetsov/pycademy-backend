const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(req, res) {
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
		const { db, status } = req.app.locals;

		try {
			const user = await db.collection('users').findOne({ email });

			if (!user) {
				let user;

				if (status) {
					user = new User(name, email, password, status);
				} else {
					user = new User(name, email, password);
				}

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
					email: 'Пользователь с таким электронным адресом уже зарегистрирован'
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
}

module.exports = {
	register: register,

	registerStuff(req, res) {
		// Set status
		req.app.locals.status = 'stuff';

		register(req, res);
	},

	async login(req, res) {
		const { email, password } = req.body;
		const { db } = req.app.locals;
		const [check, error, resStatus] = await User.checkUser(email, password, db);

		if (check) {
			// Correct credentials
			const { _id, name, status, completedTasks } = await User.getUserByEmail(
				email,
				db
			);

			const payload = { id: _id, name, email, status, completedTasks };
			const options = { expiresIn: 6000, issuer: 'pycademy-api' };
			const token = jwt.sign(payload, process.env.SECRET, options);

			res.cookie('token', token, { httpOnly: true }).sendStatus(resStatus);
		} else {
			// Incorrect credentials or server error
			res.status(resStatus).json({ error });
		}
	},

	async currentUser(req, res) {
		const { decoded } = req;

		res.status(200).json(decoded);
	},

	async logout(req, res) {
		res.clearCookie('token').sendStatus(200);
	}
};
