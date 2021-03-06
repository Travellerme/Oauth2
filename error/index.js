var path = require('path');
var util = require('util');
var http = require('http');

// Errors for sending to user
function HttpError(status, message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpError);

  this.status = status;
  this.message = message || http.STATUS_CODES[status] || "Error";
}

util.inherits(HttpError, Error);

HttpError.prototype.name = 'HttpError';

exports.HttpError = HttpError;


function AuthError(status,message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);
  
  this.status = status || 401;
  this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;
exports.messages = {
  authError:"Invalid username and password combination",
  tokenExpired:"Token expired"
};
