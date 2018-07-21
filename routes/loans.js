/* Node dependencies */
const express = require('express');
const router = express.Router();
// Adds ability to use complex operators in where statements
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* Custom dependencies */
const getData = require('../middleware/getData');

/* GET all loans list */
router.get('/', (req, res) => {
  getData
    .findLoans()
    .then(loans => {
      res.render('loans/index', {loans, title: 'Loans' });
    })
});


/* GET Create a new loan form */
router.get('/add', (req, res) => {
  res.render('loans/loan_add', { title: 'New Loan' })
});

module.exports = router;