var express = require('express');
var router = express.Router();
var model = require('./../lib/model/model-users');
var mail = require('./../lib/mail');
var cwlogs = require('./../lib/cwlogs');
var debug = require('debug')('photoalbums:router:users');

/* GET users listing. */
router.get('/', function(req, res) {
  debug('/users/');
  model.getAllUsers(function(err, obj) {
    if (err) {
      res.status(500).send({error: 'An unknown server error has occurred!'});
    } else {
      res.send(obj);
    }
  })
});

/* GET albums by user */
router.get('/user/:user', function(req, res) {
  debug('/users/user: username=%s', req.param('user'));
  var params= {
    username : req.param('user')
  }
  var eventMessage = 'GET /users/user/' + params.username;
  cwlogs.logEvent(eventMessage);
  model.getUser(params, function(err, obj) {
    if (err) {
      res.status(500).send({error: 'An unknown server error has occurred!'});
    } else {
      var eventMessage = 'getUser ' + params.username + ' ' + JSON.stringify(obj);
      cwlogs.logEvent(eventMessage);
      res.send(obj);
    }
  });
  cwlogs.putLogs();
});

/* POST user login. */
router.post('/login', function(req, res) {
  debug('/users/login: username=%s', req.param('username'));
  if (req.param('username') && req.param('password') ) {
    var params = {
      username : req.param('username').toLowerCase(),
      password : req.param('password')
    };
    var eventMessage = 'POST /users/login/' + params.username;
    cwlogs.logEvent(eventMessage);
    model.loginUser(params, function(err, obj) {
      if (err) {
	res.status(400).send({error: 'Invalid login'});
      } else {
	var eventMessage = 'loginUser ' + params.username + ' ' + JSON.stringify(obj);
	cwlogs.logEvent(eventMessage);
        req.session.userID = obj.userID;
	res.send(obj);
      }
    });
  } else {
    res.status(400).send({error: 'Invalid login'});
  }
  cwlogs.putLogs();
});

/* POST user logout. */
router.post('/logout', function(req, res) {
  debug('/users/logout');
  var eventMessage = 'POST /users/logout';
  cwlogs.logEvent(eventMessage);
  if(req.session){
    /*
    if (req.session.userID) {
      var eventMessage = 'POST /users/logout/' + req.session.userID;
      cwlogs.logEvent(eventMessage);
      model.logoutUser({userID: req.session.userID}, function(err, obj) {
	if (err) {
	  res.status(400).send({error: 'Invalid user'});
	} else {
	  var eventMessage = 'logoutUser ' + req.session.userID + ' ' + JSON.stringify(obj);
	  cwlogs.logEvent(eventMessage);
	  res.send(obj);
	}
      });
    } else {
      res.status(400).send({error: 'Invalid user'});		
    }
    */
    req.session.destroy();
  }
  res.send({message: 'User logged out successfully'});
  cwlogs.putLogs();
});

/* POST user registration. */
router.post('/register', function(req, res) {
  debug('/users/register: username=%s', req.param('username'));
  if (req.param('username') && req.param('password') && req.param('email')) {
    var email = unescape(req.param('email'));
    var emailMatch = email.match(/\S+@\S+\.\S+/);
    if (emailMatch !== null) {
      var params = {
	username : req.param('username').toLowerCase(),
	password : req.param('password'),
	email : req.param('email').toLowerCase()
      };
      var eventMessage = 'POST /users/register/' + params.username;
      cwlogs.logEvent(eventMessage);
      model.createUser(params, function(err, obj) {
	if (err) {
	  res.status(400).send({error: 'Unable to register'});
	} else {
	  var eventMessage = 'registerUser ' + params.username + ' ' + JSON.stringify(obj);
	  cwlogs.logEvent(eventMessage);
	  mail.sendRegistrationConfirmation({username: req.param('username'), email: req.param('email')}, function(errMail, objMail) {
	    if (errMail) {
	      res.status(400).send(errMail);
	    } else {
	      res.send(obj);
	    }
	  });
	}
      });
    } else {
      res.status(400).send({error: 'Invalid email'});
    }
  } else {
    res.status(400).send({error: 'Missing required field'});
  }
  cwlogs.putLogs();
});

router.get('/error', function(req, res) {
  throw new Error("[ERROR] This is an intentional error");
});


module.exports = router;
