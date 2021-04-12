const User = require('../model/user');
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// getting  user by id
exports.getuserbyid = (req, res, next, id) => {
	User.findById(id).exec((error, user) => {
		if (error) {
			return res.status(400).json({
				error: 'User not found'
			});
		}

		req.user = user;
		next();
	});
};

// creating account
exports.createAccount = (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			error: errors.array()[0].msg
		});
	}

	console.log(req.body);

	const user = new User(req.body);

	user.save((error, user) => {
		if (error) {
			return res.status(400).json({
				error: 'Account is not being created...'
			});
		}

		res.json(user);
	});
};

// signin user
exports.signin = (req, res) => {
	const { email, password } = req.body;

	console.log(email, password);

	const errors = validationResult(req.body);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: errors.array()[0].msg
		});
	}

	User.findOne({ email }, (error, user) => {
		// checking for email
		if (error || !user) {
			return res.status(400).json({
				error: 'There is no account associated with this email'
			});
		}

		// checking for password
		if (!user.authenticate(password)) {
			return res.status(401).json({
				error: "Email and password doesn't match"
			});
		}

		console.log(user);

		// generating token
		const token = jwt.sign({ _id: user._id }, process.env.SECRET);

		// setting the cookie
		res.cookie('token', token, { expire: new Date() + 9999 });

		// sending response to the user
		const { _id, firstname, lastname, email, gender } = user;
		res.json({ token, user: { _id, firstname, lastname, email, gender } });
	});
};

exports.isSignedIn = expressJWT({
	secret: process.env.SECRET,
	userProperty: 'auth',
	algorithms: [ 'sha1', 'RS256', 'HS256' ]
});

exports.isAuthenticated = (req, res, next) => {
	let checker = req.profile && req.auth && req.profile._id === req.auth._id;

	if (!checker) {
		return res.status(403).json({
			error: 'ACCESS DENIED'
		});
	}
	next();
};

exports.isAdmin = (req, res, next) => {
	if (req.profile.role === 0) {
		return res.status(403).json({
			error: 'You are not an ADMIN'
		});
	}
	next();
};

exports.getUser = (req, res) => {
	// req.user.encrypted_password = undefined;
	return res.json(req.user);
};

exports.getallusers = (req, res) => {
	User.find().sort([ [ 'sortBy', 'asc' ] ]).exec((error, users) => {
		if (error) {
			return res.status(400).json({
				error: 'No documents found in the database'
			});
		}

		res.json(users);
	});
};

exports.updateuser = (req, res) => {
	console.log(req.user);

	User.findOneAndUpdate(
		{ _id: req.user._id },
		{ $set: req.body },
		{ new: true, useFindAndModify: false },
		(error, user) => {
			if (error) {
				return res.status(400).json({
					error: 'You are not authorized to update this user'
				});
			}

			user.salt = undefined;
			user.encrypted_password = undefined;
			user.createdAt = undefined;
			user.updatedAt = undefined;
			res.json(user);
		}
	);
};

exports.accountdelete = (req, res) => {
	let user = req.user;
	console.log(req, user);

	user.remove((error, user) => {
		if (error) {
			return res.status(400).json({
				error: 'User not found'
			});
		}

		res.json(user);
	});
};
