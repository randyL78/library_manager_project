/* Node dependencies */
const express = require('express');
const router = express.Router();

/* Custom dependencies */
const LibraryData = require("../middleware/libraryData");

/* GET all loans listing. */
router.get('/', (req, res) => {
  LibraryData.getAllLoans.then( loans => res.render('loans/index', {loans, title: 'Loans' }))
});

/* Create a new loan */
router.get('/add', (req, res) => {
  res.render('loans/loan_add', { title: 'New Loan' })
});

module.exports = router;