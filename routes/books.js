/* Node dependencies */
const express = require('express');
const router = express.Router();
const createError = require('http-errors');

/* Custom dependencies */
getData = require("../middleware/getData");

/* GET books listings. */
router.get('/', function(req, res, next) {
  if (req.query.filter==='overdue') {
    getData
      .findOverdueBooks()
      .then(books => res.render('books/index', {books, title: "Books" }));
  } else if (req.query.filter==='checked_out') {
    getData
      .findCheckedOutBooks()
      .then(books => res.render('books/index', {books, title: "Books" }));
  } else if (!req.query.filter || req.query.filter ==='all') {
    getData
      .findAllBooks()
      .then( books => res.render('books/index', {books, title: "Books" }));
  } else {
    // send to 404 handler
    next(createError(404));
  }
});

/* GET a form to Create a new book */
/* Call this route before the details route to avoid trying to find a book with id of 'add' */
/* Alternatively, could add a conditional in the '/:id' route to render the add view */
router.get('/add', (req, res) => {
  res.render('books/book_add', {book: getData.buildBook(), title: "New Book"})
});

/* GET the details of a single book */
router.get('/:id', (req, res) => 
  getData
    .findBookById(req.params.id)
    .then( arrays => 
      res.render('books/book_detail', {book: arrays[0], loans: arrays[1], title: arrays[0].title})
    )
    .catch(err => createError(500))
);

/* POST a new book to the database */
router.post('/add', (req, res, next) => 
  getData
    .createBook(req.body)
    .then(book => {res.redirect(`../books/`)})
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        res.render('books/book_add', {error: err.errors[0], book: getData.buildBook(req.body), title: "New Book"})
      } else if (err.name === "SequelizeUniqueConstraintError") {
        let error = { message: "Title has already been used" }
        res.render('books/book_add', {error, book: getData.buildBook(req.body), title: "New Book"})
      } else { 
        next(createError(500));
      }
    })
    
);

/* PUT the updates to a book into the database */
router.put('*', (req, res, next) => 
  getData
    .updateBook(req.body)
    .then(book => {res.redirect(`../books/`)})
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        res.render('books/book_detail', {error: err.errors[0], book: getData.buildBook(req.body), title: req.body.title})
      } else if (err.name === "SequelizeUniqueConstraintError") {
        let error = { message: "Title has already been used" }
        res.render('books/book_detail', {error, book: getData.buildBook(req.body), title: req.body.title})
      } else { 
        next(createError(500))
      }
    })
);

module.exports = router;