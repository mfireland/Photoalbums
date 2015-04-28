var mysql = require('mysql');
var globals = require('./../globals');
var connection = mysql.createConnection(globals.database());
var debug = require('debug')('photoalbums:model:users');

function getAllUsers(callback) {
    connection.query('SELECT username, userID FROM users', function(err, rows, fields) {
	if (err) {
	    callback(err);
	} else {
	    callback(null, rows);
	}
    });
}

function getUser(params, callback) {
    debug('getUser: username=%s', params.username);
    connection.query('SELECT username, userID FROM users WHERE username=' + connection.escape(params.username), function(err, rows, fields) {
	if (err) {
	    debug('getUser: SELECT error: ', err);
	    callback(err);
	} else {
	    debug('getUser: SELECT success - rows: %d', rows.length);
	    if (rows.length > 0) {
		var userObject = rows[0];
		var modelAlbums = require('./model-albums');
		modelAlbums.getAlbumsByUser({userID: userObject.userID}, function(err, obj) {
		    if (err) {
			callback(err);
		    } else {
			userObject.albums = obj;
			callback(null, userObject);
		    }
		});
	    } else {
		callback(null, []);
	    }
	}
    });
}

function createUser(params, callback) {
    debug('createUser: username=%s', params.username);

    var newUser = {
	username : params.username,
	password : params.password,
	email : params.email
    }

    var query = 'INSERT INTO users SET ? ';

    connection.query(query, newUser, function(err, rows, fields) {
	if (err) {
	    debug('createUser: INSERT error: ', err);
	    if (err.errno == 1062) {
		var error = new Error("This username has already been taken.");
		callback(error);
	    } else {
		callback(err);
	    }
	} else {
	    debug('createUser: INSERT success');
	    callback(null, {message:'Registration successful!'});
	}
    });

}

function loginUser(params, callback) {
    debug('loginUser: username=%s', params.username);
    connection.query('SELECT username, password, userID FROM users WHERE username=' + connection.escape(params.username), function(err, rows, fields) {
	if (err) {
	    debug('loginUser: SELECT error: ', err);
	    callback(err);
	} else if (rows.length > 0) {
	    debug('loginUser: SELECT success - rows: %d', rows.length);
	    var response = {
		username : rows[0].username,
		userID : rows[0].userID
	    }
	    callback(null, response);
	} else {
	    debug('loginUser: SELECT success but no user found');
	    var error = new Error("Invalid login");
	    callback(error);
	}
    });
}


function logoutUser(params, callback) {
    debug('logoutUser');
    callback({message: 'You have logged out successfully'});
}


exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
