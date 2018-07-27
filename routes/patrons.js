/* Node dependencies */
const express = require('express');
const router = express.Router();


/* Custom dependencies */
const getData = require('../middleware/getData');


/* GET all patrons listing. */
router.get('/', function(req, res, next) {
  getData
    .findFilteredPatrons(req.query.page, req.query.term)
    .then( data => res.render('patrons/index', data))
    .catch( err => {
      next(createError(500));
    })
});

/* GET a form to add a new Patron. */
router.get('/add', (req, res) => {
  res.render('patrons/patron_add', {patron: getData.buildPatron(), title: 'New Patron' })
});

/* GET details of one patron. */
router.get('/:id', (req, res) => {
  getData
    .findPatronById(req.params.id)
    .then(arrays => {
      res.render('patrons/patron_detail', {patron: arrays[0], loans: arrays[1], title: arrays[0].dataValues.name})
    })
    .catch ( err => {
      next(createError(404));
    })
});

/* POST a new patron to database */
router.post('/add', (req, res, next) => {
  getData
    .createPatron(req.body)
    .then(() => res.redirect(`../patrons/`))
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        res.render('patrons/patron_add', {error: err.errors[0], patron: getData.buildPatron(req.body), title: "New Patron"})
      } else { 
        next(createError(500));
      }
    })
});

/* PUT updates to a patron in database */
router.put('*', (req, res, next) => {
  getData
    .updatePatron(req.body)
    .then(() => res.redirect(`../patrons/`))
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        res.render('patrons/patron_add', {error: err.errors[0], patron: getData.buildPatron(req.body), title: `${req.body.first_name} ${req.body.last_name}`})
      } else { 
        next(createError(500));
      }
    });
});

module.exports = router;