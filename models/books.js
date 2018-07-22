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
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Author field cannot be empty"
        }
      }
    },
    genre: { 
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Genre field cannot be empty",
        },
        is: {
          args: /^[a-zA-Z\s]*$/,
          msg: "Genre must contain letters and spaces only"
        }
      }
    },
    first_published: {
      type: DataTypes.INTEGER,
      validate: {
        isNumeric: {
          msg: "First Published field must be a number"
        }
      }
    }
  }, {
    timestamps: false,
    underscored: true
  });
  Books.associate = function(models) {
    // associations can be defined here
  };
  return Books;
};