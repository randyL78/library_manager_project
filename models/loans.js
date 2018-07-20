'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loans = sequelize.define('Loans', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
  }, {
    timestamps: false,
    underscored: true
  });
  Loans.associate = models => {
    Loans.belongsTo(models.Books)
    Loans.belongsTo(models.Patrons)
  };
  return Loans;
};