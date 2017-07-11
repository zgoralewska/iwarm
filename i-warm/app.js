var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var http = require('http');
var net = require('net');
var cron = require('cron');
var sha1 = require('sha1');

var api = require('./routes/api');
var login = require('./routes/login');
var models = require("./models");
require("./cron/job").startCrone(cron, models);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/client/src'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/client/src')));
app.use("/node_modules", express.static('node_modules'));
app.use(expressSession({secret: 'mySecretKey', saveUninitialized: false, cookie: {httpOnly: false }}));
app.use(cookieParser('mySecretKey'));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);


models.sequelize.sync().then(function () {
  var server = http.createServer(app);

  var io = require('socket.io').listen(server);
  io.set('origins', '*:*');

  var tcpServer = net.createServer(function(socket) {
    console.log('tcp server running on port 7700');
  });

  server.listen(3000);
  tcpServer.listen(7700, "zgoralewska.me");

  require('./socketio/index')(io, tcpServer);
});

passport.serializeUser(function(user, done) {
  console.log('IN SERIALIZE');
  done(null, user.Id);
});

passport.deserializeUser(function(id, done) {
  models.User.findById(id).then(function(user) {
    console.log('IN DESERIALIZE');
    done(null, user);
  });
});

passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      models.User.findOne({where: {Email: email}}).then(function(user) {
        if(user){
          if (sha1(password) === user.Password && user.Active[0] === 1) {
            return done(null, user);
          }
          else{
            return done(null, false, { message: 'Incorrect credentials or inactive account' });
          }
        }
        else {
          return done(null, false, { message: 'Nope' });
        }
      });
    }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('ERROR: '+ err.message);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
