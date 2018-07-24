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
const ENTRIES_PER_PAGE = 15; // change this to adjust pagination settings

/** Create a string version of today's date */
const today = () => {
  const t = (new Date(Date.now())).toISOString();
  return t.slice(0, t.indexOf('T'));
}
/** Create a string version of a date one week in the future */
const due = () => {
  const t = (new Date(Date.now() + ONE_WEEK)).toISOString();
  return t.slice(0, t.indexOf('T')); 
}

/* =============================================
 *            Books
 * ============================================= */

/** Build an empty book for form */
const buildBook = params => 
  Books
    .build(params);

/** Create a book based on request object */
const createBook = params => 
  Books
    .create(params)
    // only increment count books if successful
    .then(() => {countBooks++})

/** Finds all books in books table */
const findAllBooks = page => {
  const options = {
    order: [['title']]
  }

  if (page) {
    options.offset = ENTRIES_PER_PAGE * (page - 1);
    options.limit = ENTRIES_PER_PAGE;
  }

  return Books.findAll(options);   
}

/** find a single book by its id 
 * @param id the primary key value of book to find
 */
const findBookById = id =>
  Promise.all([
      Books.findById(id), 
      findFilteredLoans({book_id: id})
    ]);

/** find all books matching the current filter */
const findFilteredBooks = (filter = 'all', page = 1) => {
  // base options for all book searches
  let where = {}

  /* if filter is checked out, match book ids to entries
   * in loan table with no return on date
   * if filter is overdue, do the same but also check that return date
   * is less than today's date */ 
  if (filter === 'checked_out') {
    where = {returned_on: null}
  } else if (filter === 'overdue') {
    where = {
      returned_on: null,
      return_by: { [Op.lt]: today()}
    }
  } else if (filter === 'all') {
    // use find all books for better performance when no filter is needed
    return new Promise( (resolve, reject) => 
      resolve(Books.count()
    ))
    .then( totalNumber => {
      const numberOfPages = parseInt(totalNumber/ ENTRIES_PER_PAGE) + 1;
      return findAllBooks(page)
        .then(books => ({
          books,
          filter, 
          pagination: {
            numberOfPages,
            currentPage: page
          },
          title: "Books"})
        )
      })
  } else {
    // kick back invaled filter parameters
    throw new Error("Not Found");
  }

  const options = {
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
    where,
    offset : ENTRIES_PER_PAGE * (page - 1),
    limit : ENTRIES_PER_PAGE
  }


  // use Loans not Books in order to filter results
  return new Promise( (resolve, reject) => 
    resolve(Loans.count({where})
  ))
  .then( totalNumber => {
    const numberOfPages = parseInt(totalNumber/ ENTRIES_PER_PAGE) + 1
    return Loans
      .findAll(options)
      .then(books => {
        return {books, numberOfPages}
      })
  })
  .then( data => {
    return {books: data.books,
            filter,
            pagination: {
              numberOfPages: data.numberOfPages,
              currentPage: page
            },
            title: "Books"};
  })
}

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
      // find all books to populate form select
      findAllBooks(),
      // find all patrons to populate form select
      findAllPatrons()
    ])
    .then(arrays => {
      data = {
        books : arrays[0],
        patrons : arrays[1],
        loaned_on : (params) ? params.loaned_on : today(),
        return_by : (params) ? params.return_by : due(),
        selected_book : (params) ? params.book_id : null,
        selected_patron : (params) ? params.patron_id : null
      }
      return data;
    });


/** Create a new loan in loan table */
const createLoan = params => 
  Loans
    .create(params)

/** find all loans matching passed filter */
const findFilteredLoans = (params = {filter: 'all', page:'1'}) => {
  const filter = params.filter
  // Base options regardless of filter/paramater options
  const options = {
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
  }

  // Check which filter to apply, if any
  if(filter === 'checked_out') {
    options.where = {
      returned_on: null
    }
  } else if (filter === 'overdue') {
    options.where = {
      returned_on: null,
      return_by: {[Op.lt]: today()}
    }
  } else if (filter && filter !== 'all') {
    throw new Error('Not Found');
  }

  if (params.book_id) {
    options.where = { book_id: params.book_id }
  }

  if (params.patron_id) {
    options.where = { patron_id: params.patron_id }
  }

  return Loans.findAll(options);
}
  
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
      loan.returned_on = today();
      return loan;
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

/** Return a loaned book */
const updateLoan = params => 
  Loans
    .findById(params.id)
    .then(loan => loan.update(params));

/* =============================================
 *            Patrons
 * ============================================= */

/** Build an empty patron for form */
const buildPatron = params => 
  Patrons
    .build(params);

/** Create a patron based on request object */
const createPatron = params => 
    Patrons
      .create(params)
      // only increment countPatrons if succesful
      .then(() => {countPatrons++});

/** Get number of patrons in patrons table to use for pagination 
 *  Use a variable instead of running promise each time to help 
 *  Performance in larger tables */
let countPatrons = Patrons.count();

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
      findFilteredLoans({patron_id: id})
    ]);

/** Update a patron based on request object */
const updatePatron = params => 
  Patrons
    .findById(params.id)
    .then(patron => patron.update(params));

/* export all public methods */
module.exports = { 
  buildBook,
  buildPatron,
  buildLoan,
  countPatrons,
  createBook,
  createLoan,
  createPatron,
  ENTRIES_PER_PAGE,
  findAllPatrons,
  findBookById,
  findFilteredBooks,
  findFilteredLoans,
  findLoanById,
  findPatronById,
  isBookCheckedOut,
  updateBook,
  updateLoan,
  updatePatron
 };