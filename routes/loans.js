var express = require('express');
var router = express.Router();

/* GET all loans listing. */
router.get('/', function(req, res, next) {
  res.render('loans/index', { title: 'Loans' })
});

/* Create a new loan */
router.get('/add', function(req, res, next) {
  res.render('loans/loan_add', { title: 'New Loan' })
});

module.exports = router;