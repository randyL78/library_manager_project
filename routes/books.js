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

module.exports = router;