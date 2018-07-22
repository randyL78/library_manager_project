/* Node dependencies */
const express = require('express');
const router = express.Router();
// Adds ability to use complex operators in where statements
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* Custom dependencies */
const getData = require('../middleware/getData');

/* GET all loans list */
router.get('/', (req, res, next) => {
  if (req.query.filter==='overdue') {
    getData
      .findOverdueLoans()
      .then(loans => res.render('loans/index', {loans, title: "Loans" }));
  } else if (req.query.filter==='checked_out') {
    getData
      .findCheckedOutLoans()
      .then(loans => res.render('loans/index', {loans, title: "Loans" }));
  } else if (!req.query.filter || req.query.filter ==='all') {
    getData
      .findAllLoans()
      .then( loans => res.render('loans/index', {loans, title: "Loans" }));
  } else {
    // send to 404
    next();
  }
});

/* GET Create a new loan form */
router.get('/add', (req, res) => {
  getData
    .buildLoan()
    .then( data => res.render('loans/loan_add', { data, title: 'New Loan' }))
  
});

/* GET loan return */
router.get('/:id', (req, res) => {
  getData
    .findLoanById(req.params.id)
    .then(loan => res.render('patrons/return_book', {loan, title: 'Return Book' }));
}) 

/* POST a new loan to db */
router.post('/add', (req, res) => {
  getData
    .createLoan(req.body)
    .then(res.redirect('../loans/'))
});

/* PUT an update to a loan marked returned */
router.put('*', (req, res) => {
  getData
    .updateLoan(req.body)
    .then(err => {res.redirect(`../loans/`)})
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        getData
        .findLoanById(req.body.id)
        .then(loan => res.render('patrons/return_book', {error: err.errors[0], loan, title: 'Return Book' }));
      } else if (err.name === "SequelizeUniqueConstraintError") {
        let error = { message: "Title has already been used" }
        res.render('books/book_add', {error, book: getData.buildBook(req.body), title: "New Book"})
      } else { 
        next(createError(500));
      }
    })
});


module.exports = router;