'use strict';
module.exports = (sequelize, DataTypes) => {
  var Loans = sequelize.define('Loans', {
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATEONLY,
    return_by: DataTypes.DATEONLY,
    returned_on: DataTypes.DATEONLY
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