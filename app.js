const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
// make static paths easier to navigate
const path = require('path');
// to allow for PUT from HTML form
const methodOverride = require('method-override');

// Different route handlers
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const patronsRouter = require('./routes/patrons');
const loansRouter = require('./routes/loans');

const app = express();

app.use(methodOverride('_method'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/patrons', patronsRouter)
app.use('/loans', loansRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  console.log("I'm here")
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
