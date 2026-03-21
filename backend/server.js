const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/db/db');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

(async () => {
	await connectDB();

	app.get('/', (req, res) => res.send('API is running'));

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
