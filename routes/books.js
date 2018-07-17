var express = require('express');
var router = express.Router();

/* GET all books listing. */
router.get('/', function(req, res) {
  res.render('books/index', { title: 'Books' })
});

/* Get the deatails of a single book */
router.get('/book', (req, res) => {
  res.render('books/book_detail', {title: "A Brief History of Time"})
});

/* Create a new book */
router.get('/add', (req, res) => {
  res.render('books/book_add', {title: "New Book"})
});

module.exports = router;