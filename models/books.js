'use strict';
module.exports = (sequelize, DataTypes) => {
  var Books = sequelize.define('Books', {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { 
          msg: "Title field cannot be empty"
        }
      }
    },
    author: DataTypes.STRING,
    genre: DataTypes.STRING,
    first_published: DataTypes.INTEGER
  }, {
    timestamps: false,
    underscored: true
  });
  Books.associate = function(models) {
    // associations can be defined here
  };
  return Books;
};