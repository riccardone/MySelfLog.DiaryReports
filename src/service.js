module.exports = function (config) {
    var path = require('path');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');

    var diaryRepository = (config && config.diaryRepository) || elasticDiaryRepository();
    var diaryRoute = require('./routes/diary')(diaryRepository);

    var express = require('express');
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

    app.use('/diary', diaryRoute);

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

    return app;
};

function elasticDiaryRepository() {
    // TODO get the configs from env variables
    var elasticRepositoryModule = require('./elasticRepository');
    return new elasticRepositoryModule();
}
