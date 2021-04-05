const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { isAdmin } = require('../../../learnbackend/controllers/auth');

const { createAccount, signin, isSignedIn, getallusers, getuserbyid, updateuser, accountdelete } = require('../controllers/auth');

// getting user by id
router.param('userId', getuserbyid)

// creating account
router.post(
	'/createaccount',
	[
		check('firstname').isLength({ min: 3, max: 15 }).withMessage('First name should be between 3-15 characters'),
		check('lastname').isLength({ min: 3, max: 15 }).withMessage('Last name should be between 3-15 characters'),
		check('email').isEmail().withMessage('Email is not valid'),
		check('password').isLength({ min: 5 }).withMessage('Your password should be between 5-30 characters')
	],
	createAccount
);

// signin user
router.post('/signin', signin);


// get all users
router.get('/users', isSignedIn, getallusers)

// update user
router.put('/updateuser/:userId', isSignedIn, updateuser)


// deleting user
router.delete('/account/delete/:userId', isSignedIn, accountdelete)

module.exports = router;
