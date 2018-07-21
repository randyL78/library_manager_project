/* Node dependencies */
const express = require('express');
const router = express.Router();

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
    // send to 404
    next();
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
    .then( arrays => res.render('books/book_detail', {book: arrays[0], loans: arrays[1], title: arrays[0].title}))
);

/* POST a new book to the database */
router.post('/add', (req, res) => 
  getData
    .createBook(req.body)
    .then(res.redirect(`../books/`))
);

/* PUT the updates to a book into the database */
router.put('*', (req, res) => 
  getData
    .updateBook(req.body)
    .then(res.redirect(`../books/`))
);

module.exports = router;