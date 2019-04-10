require('dotenv').config();
const port = process.env.PORT;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.DB_URI, { useNewUrlParser: true });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/tasks', require('./routes/api/tasks'));

// Start server
app.listen(port, async () => {
	console.log(`Server started on port ${port}`);

	try {
		await client.connect();
		console.log('Connected to MongoDB');

		const db = client.db(process.env.DB_NAME);
		app.locals.db = db;
	} catch (err) {
		console.log(err);
	}
});
