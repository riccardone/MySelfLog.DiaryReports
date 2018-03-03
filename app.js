module.exports = function (config) {
  var diaryRepository = (config && config.diaryRepository) || elasticDiaryRepository();
  var routes = require('./routes')(diaryRepository);

  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');

  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.locals.pretty = true;

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', function (req, res) {
    res.send('ok');
  });
  app.get('/stock/:isbn', routes.getCount);
  app.post('/stock', routes.stockUp);

  return app;
};

function elasticDiaryRepository() {
  // TODO get the configs from env variables
  var elasticRepositoryModule = require('../public/javascripts/elasticRepository');
  return new elasticRepositoryModule();
}

require('dotenv').config()
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var diary = require('./routes/diary');

var app = express();

app.get('/health', function (req, res) {
  res.send('ok');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.pretty = true;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/diary', diary);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(process.env.App_Port, process.env.App_Host, function () {
  var address = server.address().address + ":" + server.address().port;
  console.log("App started on on %s", address)
});

module.exports = server;
