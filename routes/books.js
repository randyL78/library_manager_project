const express = require('express');
const router = express.Router();
const Books = require("../models").Books

/* GET all books listing. */
router.get('/', function(req, res) {
  Books
    .findAll()
    .then(books => {
      console.log(books[0].id);
      res.render('books/index', {books: books, title: "Books" })
    })
});

/* GET a form to Create a new book */
/* Call this route before the details route to avoid trying to find a book with id of 'add' */
/* Alternatively, could add a conditional in the '/:id' route to render the add view */
router.get('/add', (req, res) => {
  res.render('books/book_add', {book: Books.build(), title: "New Book"})
});

/* Get the details of a single book */
router.get('/:id', (req, res) => {
  Books
    .findById(req.params.id)
    .then(book => {
      res.render('books/book_detail', {book, title: book.title})
    })
});


/* POST a new book to the database */
router.post('/add', (req, res) => {
  Books
    .create(req.body)
    .then(book => {
      res.redirect("../books/add");
    })
})

module.exports = router;