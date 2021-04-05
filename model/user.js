var mongoose = require('mongoose');
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');

const userSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
			trim: true
		},
		lastname: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			trim: true
		},
		gender: {
			type: String,
			required: true,
			trim: true
		},
		encrypted_password: {
			type: String,
			required: true
		},
		role: {
			type: String,
			default: 0
		},
		salt: String
	},
	{ timestamps: true }
);

userSchema
	.virtual('password')
	.set(function(password) {
		this._password = password;
		this.salt = uuidv1();
		this.encrypted_password = this.securePassword(password);
	})
	.get(function() {
		return this._password;
	});

userSchema.methods = {
	authenticate: function(plainpassword) {
		return this.securePassword(plainpassword) === this.encrypted_password;
	},
	securePassword: function(plainpassword) {
		if (!plainpassword) return '';
		try {
			return crypto.createHmac('sha256', this.salt).update(plainpassword).digest('hex');
		} catch (error) {
			console.log(error)
		}
	}
};

module.exports = mongoose.model('User', userSchema);
