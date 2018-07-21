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


/* =============================================
 *            Loans
 * ============================================= */

/** find the loans in the loan table
 * and match up the book title and patron name 
 * int the loans table 
 * @param book_id (optional) The id of the book to find the loans of, otherwise find all loans
 */
const findLoans = book_id => 
  new Promise( resolve => {
    let options = {
      order: [['loaned_on']],
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
      }
    }
    if (book_id) { 
      options.where = { book_id }
    }

    return Loans
      .findAll(options)
      .then( loans => {
        resolve(loans)
      })
  });
    


/* =============================================
 *            Books
 * ============================================= */

/** find all books that are checked out 
 * by matching entries with empty returned_on columns 
 * in loan tables to book id */
findCheckedOutBooks = () =>
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
findOverdueBooks = () =>
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


/** find all books in books table */
findAllBooks = () =>
  Books
    .findAll({order:[['title']]});

/** find a single book by its id 
 * @param id the primary key value of book to find
 */
findBookById = id =>
    Promise.all([
      Books.findById(id), 
      findLoans(id)
    ]).then(
      arrays => {
       return (arrays);
      }
    );

/** Build an empty book for form */
buildBook = () => Books.build();

/** Create a book based on request object */
createBook = params => 
  Books
    .create(params)

/** Update a book based on request object */
updateBook = params =>
  Books
    .findById(params.id)
    .then(book => book.update(params))

/* =============================================
 *            Loans
 * ============================================= */

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
    






module.exports = { 
  findLoans, 
  findCheckedOutBooks, 
  findAllBooks,
  findAllPatrons,
  findBookById,
  findCheckedOutBooks,
  findOverdueBooks,
  buildBook,
  createBook,
  updateBook,
  Books
 };