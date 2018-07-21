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

/* GET loan return */
router.get('/:id', (req, res) => {
  getData
    .findLoanById(req.params.id)
    .then(loan => res.render('patrons/return_book', {loan, title: 'Return Book' }));
}) 

/* PUT an update to a loan marked returned */
router.put('*', (req, res) => {
  getData
    .updateLoan(req.body)
    .then(res.redirect(`../loans`))
  
});


module.exports = router;