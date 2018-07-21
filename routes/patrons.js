/* Node dependencies */
const express = require('express');
const router = express.Router();


/* Custom dependencies */
const Patrons = require("../models").Patrons;
const getData = require('../middleware/getData');


/* GET all patrons listing. */
router.get('/', function(req, res, next) {
  getData
    .findAllPatrons()
    .then( patrons => res.render('patrons/index', {patrons, title: 'Patrons' }));
});

/* GET a form to add a new Patron. */
router.get('/add', (req, res) => {
  res.render('patrons/patron_add', {patron: getData.buildPatron(), title: 'New Patron' })
});

/* GET loan return */
router.get('/return/:id', (req, res) => {
  getData
    .findLoanById(req.params.id)
    .then(loan => res.render('patrons/return_book', {loan, title: 'Return Book' }));
}) 

/* GET details of one patron. */
router.get('/:id', (req, res) => {
  getData
    .findPatronById(req.params.id)
    .then(patron => {
      res.render('patrons/patron_detail', {patron, title: `${patron.first_name} ${patron.last_name}`})
    });
});

/* POST a new patron to database */
router.post('/add', (req, res) => {
  getData
    .createPatron(req.body)
    .then(res.redirect(`../patrons/`));
});

/* PUT an update to a loan marked returned */
router.put('*', (req, res) => {
  console.log("I've been returned");
  res.redirect(`/`)
});

/* PUT updates to a patron in database */
router.put('*', (req, res) => {
  getData
    .updatePatron(req.body)
    .then(res.redirect(`../patrons/`));
});




module.exports = router;