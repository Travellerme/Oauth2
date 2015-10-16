var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	AuthCode = new Schema({
		name: {
			type: String,
			unique: true,
			required: true
		},
		clientId: {
			type: String,
			required: true
		},
        userId: {
			type: String,
			required: true
		},
		redirectURI: {
			type: String,
			required: true
		}
	},{ collection: 'authCode' });

module.exports = mongoose.model('AuthCode', AuthCode);
