var express = require('express');
var router = express.Router();

/* GET all books listing. */
router.get('/', function(req, res, next) {
  res.render('books/index', { title: 'Books' })
});

module.exports = router;