/* Node dependencies */
const express = require('express');
const router = express.Router();
const createError = require('http-errors');
// Adds ability to use complex operators in where statements
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* Custom dependencies */
const getData = require('../middleware/getData');

/* GET all loans list */
router.get('/', (req, res, next) => {
  // check which type of filter is being applied
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
router.get('/:id', (req, res, next) => {
  getData
    .findLoanById(req.params.id)
    .then(loan => res.render('patrons/return_book', {loan, title: 'Return Book' }))
    .catch(err => {
      next(createError(404));
    });
      
}) 

/* POST a new loan to db */
router.post('/add', (req, res, next) => {
  /* Okay, have a little bit of promise hell going on,
   * Will have to figure out how to clean it up.... later. */
  getData
    /* find out if book is already checked out before adding new loan to db,
     * internally throws a CustomValidationError if its checked out */
    .isBookCheckedOut(req.body.book_id)
    .then(() => 
      // if then is called, book is not checked out, add loan to db
      getData
        .createLoan(req.body)
        .catch(err => {
          // Throw sequelize error back to caller, otherwise its an unhandled rejection
          throw err
        })
    )
    // if all went well redirect to loans listing view
    .then(() => {res.redirect('../loans/')})
    .catch(err => {
      // catch errors from .isBookCheckedOut and .createLoan here and rerender the new loan view
      if (err.name === "SequelizeValidationError" || err.name === 'CustomValidationError') {
        getData
          .buildLoan(req.body)
          .then( data => {
            res.render('loans/loan_add', { error: err.errors[0], data, title: 'New Loan' })
          })
      } else { 
        next(createError(500)); 
      }
    })
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
      } else { 
        next(createError(500));
      }
    })
});


module.exports = router;