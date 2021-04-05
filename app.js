require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const app = express();

const cors = require('cors');



// connecting mongoose
mongoose
.connect(process.env.DATABASE, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => console.log('Database connected successfully'))
.catch((error) => console.log('Database connection failed', error));

// setting port
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors())


// brining all the routes
const authRoutes = require('./routes/auth');

// routes
app.use('/api', authRoutes);

// listening to the server
app.listen(port, () => {
	console.log('Server started successfully...');
});
