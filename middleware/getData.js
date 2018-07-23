/* Main middleware for performing all of the 
 * database interactions to keep routes uncluttered */

const Sequelize = require('sequelize');
// Adds ability to use complex operators in where statements
const Op = Sequelize.Op;

/* Custom dependencies */
const Models = require('../models');
const Loans = Models.Loans
const Books = Models.Books
const Patrons = Models.Patrons

/* Other global variables */
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const TODAY = (new Date(Date.now())).toISOString(); 
const DUE = (new Date(Date.now() + ONE_WEEK)).toISOString();

const TODAY_DATE_ONLY = TODAY.slice(0, TODAY.indexOf('T'));
const DUE_DATE_ONLY = DUE.slice(0, DUE.indexOf('T'));


/* =============================================
 *            Books
 * ============================================= */

/** Build an empty book for form */
const buildBook = params => Books.build(params);

/** Create a book based on request object */
const createBook = params => 
  Books
    .create(params)

/** find all books in books table */
const findAllBooks = () =>
Books
  .findAll({order:[['title']]});

/** find a single book by its id 
 * @param id the primary key value of book to find
 */
const findBookById = id =>
  Promise.all([
      Books.findById(id), 
      findLoanByBook(id)
    ]);

/** find all books that are checked out 
 * by matching entries with empty returned_on columns 
 * in loan tables to book id */
const findCheckedOutBooks = () =>
  // Use loans to find books because loans is a belongs 
  // to relationship with books
  Loans
    .findAll({
      include: [{
        model: Books
      }],
      attributes: [
        ['book_id', 'id'],
        [Sequelize.literal('Book.title'), 'title'],
        [Sequelize.literal('Book.author'), 'author'],
        [Sequelize.literal('Book.genre'), 'genre'],
        [Sequelize.literal('Book.first_published'), 'first_published']        
      ],
      order:[[Sequelize.literal('Book.title')]],
      where: {
        returned_on: null
      }
    });

/** find all books that are checked out 
 * by matching entries with empty returned_on columns 
 * and return_by date is less than today's date in loan tables
 *  to book id */
const findOverdueBooks = () => {
  // Use loans to find books because loans is a belongs 
  // to relationship with books
  return Loans
    .findAll({
      include: [{
        model: Books
      }],
      attributes: [
        ['book_id', 'id'],
        [Sequelize.literal('Book.title'), 'title'],
        [Sequelize.literal('Book.author'), 'author'],
        [Sequelize.literal('Book.genre'), 'genre'],
        [Sequelize.literal('Book.first_published'), 'first_published']        
      ],
      order:[[Sequelize.literal('Book.title')]],
      where: {
        returned_on: null,
        return_by: { [Op.lt]: TODAY_DATE_ONLY}
      }
    })
};

/** Update a book based on request object */
const updateBook = params =>
  Books
    .findById(params.id)
    .then(book => book.update(params))

/* =============================================
 *            Loans
 * ============================================= */

/** Build object for new loan view */
const buildLoan = params => 
  Promise
    .all([
      findAllBooks(),
      findAllPatrons()
    ])
    .then(arrays => {
      data = {
        books : arrays[0],
        patrons : arrays[1],
        loaned_on : (params) ? params.loaned_on : TODAY_DATE_ONLY,
        return_by : (params) ? params.return_by : DUE_DATE_ONLY,
        selected_book : (params) ? params.book_id : null,
        selected_patron : (params) ? params.patron_id : null
      }
      return data;
    });

/** Check if book is checked out */
const isBookCheckedOut = book_id => 
  Loans
    .findAll()
    .then(loans => {
      loans.forEach(loan => {
        if(loan.book_id == book_id && !loan.returned_on) {
          const err = new Error("CustomValidationError: Book is already checked out");
          err.name = "CustomValidationError";
          err.errors = [{message: "Book is already checked out. Please select a different book"}]
          throw err;
        }
      })
    });

/** Create a new loan in loan table */
const createLoan = params => 
  Loans
    .create(params)



/** find the loans in the loan table
 * and match up the book title and patron name 
 * int the loans table 
 * @param book_id (optional) The id of the book to find the loans of, otherwise find all loans
 */
const findAllLoans = book_id => {
  let options = {
    order: [['loaned_on']],
    include: [{
      model: Books
    },{
      model: Patrons     
    }],
    order: [['loaned_on', 'DESC'], [Sequelize.literal('Book.title'), 'ASC'] ],
    attributes: {
      include: [
        [Sequelize.literal('Book.title'), 'book_title'], 
        // Concactenate first name and last name into patron_name
        [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
      ]
    },

  }
  if (book_id) { 
    options.where = { book_id }
  }

  return Loans.findAll(options)
};

/** find all loans that are still checked out */
const findCheckedOutLoans = () =>
  Loans
    .findAll({include: [{
      model: Books
    },{
      model: Patrons     
    }],
    attributes: {
      include: [
        [Sequelize.literal('Book.title'), 'book_title'], 
        // Concactenate first name and last name into patron_name
        [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
      ]
    },
    order: [['loaned_on', 'DESC'], [Sequelize.literal('Book.title'), 'ASC'] ],
    where: {
      returned_on: null
    }
  });
    
/** find a loan on its book_id value */
findLoanByBook = book_id => 
  Loans
    .findAll({
      include: [{
        model: Books
      },{
        model: Patrons     
      }],
      attributes: {
        include: [
          [Sequelize.literal('Book.title'), 'book_title'], 
          // Concactenate first name and last name into patron_name
          [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
        ]
      },
      order: [['loaned_on', 'DESC'], [Sequelize.literal('Book.title'), 'ASC'] ],
      where: {
        book_id
      }
    })
    .then(loan => {
      loan.returned_on = TODAY_DATE_ONLY
      return loan;
    });
  
  /** find a loan on its primary key value */
findLoanById = id => 
Loans
  .findById(id, {
    include: [{
      model: Books
    },{
      model: Patrons     
    }],
    attributes: {
      include: [
        [Sequelize.literal('Book.title'), 'book_title'], 
        // Concactenate first name and last name into patron_name
        [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
      ]
    },
  })
  .then(loan => {
    loan.returned_on = TODAY_DATE_ONLY
    return loan;
  });

  /** find a loan on its book_id value */
findLoanByPatron = patron_id => 
Loans
  .findAll({
    include: [{
      model: Books
    },{
      model: Patrons     
    }],
    attributes: {
      include: [
        [Sequelize.literal('Book.title'), 'book_title'], 
        // Concactenate first name and last name into patron_name
        [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
      ]
    },
    order: [['loaned_on', 'DESC'], [Sequelize.literal('Book.title'), 'ASC'] ],
    where: {
      patron_id
    }
  })
  .then(loan => {
    loan.returned_on = TODAY_DATE_ONLY
    return loan;
  });

  /** find all loans that are overdue */
  const findOverdueLoans = () =>
    Loans
      .findAll({include: [{
        model: Books
      },{
        model: Patrons     
      }],
      attributes: {
        include: [
          [Sequelize.literal('Book.title'), 'book_title'], 
          // Concactenate first name and last name into patron_name
          [Sequelize.literal("Patron.first_name || '  ' || Patron.last_name"), 'patron_name']
        ]
      },
      order: [['loaned_on', 'DESC'], [Sequelize.literal('Book.title'), 'ASC'] ],
      where: {
        returned_on: null,
        return_by: {[Op.lt]: TODAY}
      }
  });

  /** Return a loaned book */
  const updateLoan = params => 
    Loans
     .findById(params.id)
     .then(loan => loan.update(params));

/* =============================================
 *            Patrons
 * ============================================= */

/** Build an empty patron for form */
const buildPatron = () => Patrons.build();

/** Create a patron based on request object */
const createPatron = params => 
    Patrons
      .create(params);

/** find all Patrons in patrons table */
const findAllPatrons = () => 
  Patrons
    .findAll({
      // sort by last name then by first name
      order: [['last_name'],['first_name']],
      attributes: {
        include: [
          // Concactenate first name and last name into name
          [Sequelize.literal("first_name || '  ' || last_name"), 'name']
        ]
      }
    });

/** find a single patron by their id 
 * @param id the primary key value of the patron to find
 */
const findPatronById = id => 
  Promise
    .all([
      Patrons.findById(id, {
        attributes: {
          include: [
            [Sequelize.literal("first_name || '  ' || last_name"), 'name']
          ]
        }
      }), 
      findLoanByPatron(id)
    ]);



/** Update a patron based on request object */
const updatePatron = params => 
  Patrons
    .findById(params.id)
    .then(patron => patron.update(params));


/* export all public modules */
module.exports = { 
  buildBook,
  buildPatron,
  buildLoan,
  createBook,
  createLoan,
  createPatron,
  findAllLoans, 
  findAllBooks,
  findAllPatrons,
  findBookById,
  findCheckedOutBooks,
  findCheckedOutLoans,
  findLoanById,
  findPatronById,
  findOverdueBooks,
  findOverdueLoans,
  isBookCheckedOut,
  updateBook,
  updateLoan,
  updatePatron
 };