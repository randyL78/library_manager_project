/* Node dependencies */
const express = require('express');
const router = express.Router();

/* Custom dependencies */
const Patrons = require("../models").Patrons
const LibraryData = require("../middleware/libraryData");

/* GET all patrons listing. */
router.get('/', function(req, res, next) {
  Patrons
    .findAll({order: [['last_name'],['first_name']]})
    .then( patrons => res.render('patrons/index', {patrons, title: 'Patrons' }));
});

/* GET a form to add a new Patron. */
router.get('/add', (req, res) => {
  res.render('patrons/patron_add', {patron: Patrons.build(), title: 'New Patron' })
});

/* GET details of one patron. */
router.get('/:id', (req, res) => {
  Patrons
    .findById(req.params.id)
    .then(patron => {
      res.render('patrons/patron_detail', {patron, title: `${patron.first_name} ${patron.last_name}`})
    });
});

/* POST a new patron to database */
router.post('/add', (req, res) => {
  Patrons
    .create(req.body)
    .then( patron => res.redirect(`../patrons/${patron.id}`));
});

/* PUT updates to a patron in database */
router.put('*', (req, res) => {
  Patrons
    .findById(req.body.id)
    .then( patron => patron.update(req.body))
    .then( patron => res.redirect(`../patrons/${patron.id}`));
});


module.exports = router;