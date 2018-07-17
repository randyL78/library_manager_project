var express = require('express');
var router = express.Router();

/* GET all patrons listing. */
router.get('/', function(req, res, next) {
  res.render('patrons/index', { title: 'Patrons' })
});

module.exports = router;