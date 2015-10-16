var mongoose = require('mongoose'),
	Schema = mongoose.Schema,

	Client = new Schema({
		name: {
			type: String,
			unique: true,
			required: true
		},
		randomId: {
			type: String,
			unique: true,
			required: true
		},
		secret: {
			type: String,
			required: true
		}
	},{ collection: 'client' });

module.exports = mongoose.model('Client', Client);
