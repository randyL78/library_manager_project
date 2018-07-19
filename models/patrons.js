'use strict';
module.exports = (sequelize, DataTypes) => {
  var Patrons = sequelize.define('Patrons', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    library_id: DataTypes.STRING,
    zip_code: DataTypes.INTEGER
  }, {
    timestamps: false
  });
  Patrons.associate = function(models) {
    // associations can be defined here
  };
  return Patrons;
};