var express = require('express');
var router = express.Router();

/* GET all patrons listing. */
router.get('/', function(req, res, next) {
  res.render('patrons/index', { title: 'Patrons' })
});

/* GET details of one patron. */
router.get('/patron', function(req, res, next) {
  res.render('patrons/patron_detail', { title: 'Andrew Chalkley' })
});

/* Add a new Patron. */
router.get('/add', function(req, res, next) {
  res.render('patrons/patron_add', { title: 'New Patron' })
});

module.exports = router;