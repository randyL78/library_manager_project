/* Node dependencies */
const express = require('express');
const router = express.Router();

/* Custom dependencies */
const Books = require("../models").Books


/* GET all books listing. */
router.get('/', function(req, res) {
  Books
    .findAll({order: [['title']]})
    .then( books => res.render('books/index', {books, title: "Books" }));
});

/* GET a form to Create a new book */
/* Call this route before the details route to avoid trying to find a book with id of 'add' */
/* Alternatively, could add a conditional in the '/:id' route to render the add view */
router.get('/add', (req, res) => {
  res.render('books/book_add', {book: Books.build(), title: "New Book"})
});

/* GET the details of a single book */
router.get('/:id', (req, res) => {
  Books
    .findById(req.params.id)
    .then( book => res.render('books/book_detail', {book, title: book.title}));
});

/* POST a new book to the database */
router.post('/add', (req, res) => {
  Books
    .create(req.body)
    .then( book => res.redirect(`../books/${book.id}`))
})

/* PUT the updates to a book into the database */
router.put('*', (req, res) => {
  Books
    .findById(req.body.id)
    .then( book => book.update(req.body))
    .then( book => res.redirect(`../books/${book.id}`));
});

module.exports = router;