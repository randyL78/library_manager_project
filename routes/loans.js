/* Node dependencies */
const express = require('express');
const router = express.Router();
// Adds ability to use complex operators in where statements
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* Custom dependencies */
const LibraryData = require("../middleware/libraryData");

/* Custom dependencies */
const Loans = require("../models").Loans
const Books = require("../models").Books
const Patrons = require("../models").Patrons


// /* GET all loans listing. */
// router.get('/', (req, res) => {
//   LibraryData.getAllLoans.then( loans => res.render('loans/index', {loans, title: 'Loans' }))
// });

router.get('/', (req, res) => {
  Loans
    .findAll({
      include: [{
        model: Books, 
      },{
        model: Patrons,      
      }],
      attributes: {
        include: [
          [Sequelize.literal('Book.title'), 'book_title'], 
          [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
        ]
      }
    })
    .then(loans => {
      console.log(loans[0].dataValues.book_title);
      res.render('loans/index', {loans, title: 'Loans' });
    })
});


/* Create a new loan */
router.get('/add', (req, res) => {
  res.render('loans/loan_add', { title: 'New Loan' })
});

module.exports = router;