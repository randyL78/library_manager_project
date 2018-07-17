var express = require('express');
var router = express.Router();

/* GET all loans listing. */
router.get('/', function(req, res, next) {
  res.render('loans/index', { title: 'Loans' })
});

module.exports = router;