'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loans = sequelize.define('Loans', {
    book_id: {
      type : DataTypes.INTEGER,
      validate : {
        isInt : { msg: "A book must be selected" }, 
        notEmpty: { msg: "A book must be selected"},
      }
    },
    patron_id: {
      type : DataTypes.INTEGER,
      validate : {
        isInt : {
          msg: "A patron must be selected"
        },
        notEmpty: { msg: "A patron must be selected"}
      }
    },
    loaned_on: { 
      type: DataTypes.DATEONLY,
      validate: {
        isDate: {
          msg: "Loaned on field must be a date"
        }
      }
     },
    return_by:{ 
      type: DataTypes.DATEONLY,
      validate: {
        isDate: {
          msg: "Return by field must be a date"
        }
      }
     },
    returned_on: { 
      type: DataTypes.DATEONLY,
      validate: {
        isDate: {
          msg: "Returned on field must be a date"
        },
      }
     },
  }, {
    timestamps: false,
    underscored: true,
    validate: {
      isAfterLoanedOn() {
        if (this.return_by <= this.loaned_on) {
          throw new Error("Return by must be later date than loaned on")
        }
      },
      bookIsNull() {
        if (!this.book_id) {
          throw new Error("A book must be selected")
        }
      },
      patronIsNull() {
        if (!this.patron_id) {
          throw new Error("A patron must be selected")
        }
      }
    }
  });
  Loans.associate = models => {
    Loans.belongsTo(models.Books)
    Loans.belongsTo(models.Patrons)
  };      
  return Loans;
};