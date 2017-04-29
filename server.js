var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var debug = require('debug')('photoalbums:server');
var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');
var albums = require('./routes/albums');
var globals = require('./lib/globals');
var cwlogs = require('./lib/cwlogs');
var mysql = require('mysql');
var app = express();

app.set('env', globals.environment());
debug('process environment [%s]', app.get('env'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(expressSession({
  resave: true,
  saveUninitialized: true,
  secret: 'ima secret, huh? asdkjfhjkla938475789045(&*^*(&^'
}));

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest: './tmp/'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/photos', photos);
app.use('/albums', albums);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  debug('development environment');
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  cwlogs.logEvent(err.stack);
  cwlogs.putLogs();
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.set('port', globals.applicationPort());

var server = app.listen(app.get('port'), () => {
  debug('Express server listening on port ' + server.address().port);
  var connection  = mysql.createConnection(globals.database());
  connection.connect(err => {
    if (err) {
      console.log('error connecting to database:', err);
    } else {
      console.log('connected to database!');
    }
  }); 
});
