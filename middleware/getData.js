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
const ENTRIES_PER_PAGE = 12; // change this to adjust pagination settings

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
    // .then(() => {countBooks++})

/** Finds all books in books table */
const findAllBooks = (options = {}, where = {}) => {
  options.order = [['title']];
  options.where = where.where;

  return Books.findAll(options)  
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
const findFilteredBooks = (filter = 'all', page = 1, term="") => {
  // declare an empty where object here and then set base on filter
  let optionBase = {};
  let filteredWhere = {};
  let allWhere = {
    where: {
        [Op.or]: [
          {title : {
            [Op.like] : `%${term}%`
          }},
          {author: {
            [Op.like] : `%${term}%`
          }},
          {genre: {
            [Op.like] : `%${term}%`
          }},        
        ]}
    };
    let filteredInclude = [{ 
      model: Books,
      where: allWhere.where
      }];
    
 
  if (page) {
    optionBase.offset = ENTRIES_PER_PAGE * (page - 1),
    optionBase.limit = ENTRIES_PER_PAGE
  }

  if (filter === 'all') {
    /* use find all books for better performance when no filter is needed
     * especially in larger databases */
    return Books
      .count(allWhere)  
      .then( totalNumber => {
        // calculate number of pages worth of data
        const numberOfPages = parseInt(totalNumber/ ENTRIES_PER_PAGE) + 1;
        // Extract sequelize options
        return findAllBooks(optionBase, allWhere)
          .then(books => ({
            books,
            filter, 
            pagination: {
              numberOfPages,
              currentPage: page
            },
            term,
            title: "Books"})
          )
        })
  /* if filter is checked out, match book ids to entries
   * in loan table with no return on date
   * if filter is overdue, do the same but also check that return date
   * is less than today's date */ 
  } else if (filter === 'checked_out') {
    // TODO: UNcomment to filter by unreturned books
    filteredWhere.returned_on= null
  } else if (filter === 'overdue') {
    // TODO: UNcomment to filter by checked out books
    filteredWhere.returned_on = null,
    filteredWhere.return_by= { [Op.lt]: today()}
  } else {
    // kick back invaled filter parameters
    throw new Error("Not Found");
  }

  /* extract sequelize options to help make loan promise chain
   * more readable */
  optionBase.include = filteredInclude;
  optionBase.attributes = [
    ['book_id', 'id'],
    [Sequelize.literal('Book.title'), 'title'],
    [Sequelize.literal('Book.author'), 'author'],
    [Sequelize.literal('Book.genre'), 'genre'],
    [Sequelize.literal('Book.first_published'), 'first_published']        
  ];
  optionBase.order = [[Sequelize.literal('Book.title')]];
  optionBase.where = filteredWhere;


  // use Loans not Books in order to filter results
  return Loans
    // fetch number of entries that meet criteria without returning whole database
    .count({include: filteredInclude, where: filteredWhere})
    .then( totalNumber => {
      const numberOfPages = parseInt(totalNumber/ ENTRIES_PER_PAGE) + 1
      return Loans
        .findAll(optionBase)
        .then(books => ({books, numberOfPages}))
    })
    .then( data => {
      return {
        books: data.books,
        filter,
        pagination: {
          numberOfPages: data.numberOfPages,
          currentPage: page
        },
        term,
        title: "Books"
      };
    }).catch(err => console.log(err))
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
    // only increment countPatrons if successful
    // .then(() => {countPatrons++});

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
      },
    })    

/** Return patrons based on pagination techniques */
const findFilteredPatrons = (page = 1, term = "") => {
  // Build out the WHERE conditionals using the search term
  const searchWhere = {
    [Op.or]: [
      {first_name : {
        [Op.like] : `%${term}%`
      }},
      {last_name: {
        [Op.like] : `%${term}%`
      }},
      {email: {
        [Op.like] : `%${term}%`
      }}, 
      {library_id: {
        [Op.like] : `%${term}%`
      }},  
      {zip_code: {
        [Op.like] : `%${term}%`
      }},         
    ]}

    // Extract out sequelize options to help keep Patrons Promise chain readable
    optionBase = {
      // sort by last name then by first name
      order: [['last_name'],['first_name']],
      attributes: {
        include: [
          // Concactenate first name and last name into name
          [Sequelize.literal("first_name || '  ' || last_name"), 'name']
        ]
      },
      where: searchWhere,
      offset : ENTRIES_PER_PAGE * (page - 1),
      limit : ENTRIES_PER_PAGE
    }


  return Patrons
  // fetch number of entries that meet criteria without returning whole database
  .count({where: searchWhere})
  .then( totalNumber => {
    const numberOfPages = parseInt(totalNumber/ ENTRIES_PER_PAGE) + 1
    return Patrons
      .findAll(optionBase)
      .then( patrons => ({patrons, numberOfPages}))
  })
  .then(data => ({
    patrons: data.patrons,
    pagination: {
      numberOfPages: data.numberOfPages,
      currentPage: page
    },
      term,
      title: "Patrons"
    })
  );
}
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
  createBook,
  createLoan,
  createPatron,
  findAllPatrons,
  findBookById,
  findFilteredBooks,
  findFilteredLoans,
  findFilteredPatrons,
  findLoanById,
  findPatronById,
  isBookCheckedOut,
  updateBook,
  updateLoan,
  updatePatron
 };