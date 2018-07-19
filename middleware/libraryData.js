/* Custom dependencies */
const Loans = require("../models").Loans
const Books = require("../models").Books
const Patrons = require("../models").Patrons

/* Returns an array of Loans */
const getLoans = new Promise((resolve) => { 
  Loans
    .findAll()
    .then( loans => {
      new Promise((resolve) => {
        loans.forEach(loan => {
          loan.book_title = Promise.resolve(Books.findById(loan.book_id).title)
        });
        resolve(loans);
      })
      resolve(loans);
    })
});

/* Returns an array of just the book id and titles */
const getBookTitles = new Promise(resolve => {
  Books
    .findAll({attributes: ['id', 'title']})
    .then(books => {
      resolve(books);
    })
})

/* Returns an array of just the patron id and names */
const getPatronNames = new Promise(resolve => {
  Patrons
    .findAll({attributes: ['id', 'first_name', 'last_name']})
    .then(patrons => {
       return patrons.map(patron => ({ id: patron.id, name: `${patron.first_name} ${patron.last_name}`}))
    })
    .then(patrons => {
      resolve(patrons);
    })
})

/* Returns an array of loans with book titles and and authors */
const getAllLoans = new Promise((resolve) => {
  Promise
    .all([getLoans, getBookTitles, getPatronNames])
    .then(arrays => {
      arrays[0].forEach(loan => {
        loan.book_title = arrays[1].find( book => book.id === loan.book_id).title;
        loan.patron_name = arrays[2].find( patron => patron.id === loan.patron_id).name;
      })
      resolve(arrays[0]);
    });
});

module.exports = {getAllLoans};