'use strict';
module.exports = (sequelize, DataTypes) => {
  var Patrons = sequelize.define('Patrons', {
    first_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { 
          msg: "First name field cannot be blank"
        },
        is: {
          args: /^[a-zA-Z\s]*$/,
          msg: "First name must contain letters and spaces only"
        }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { 
          msg: "Last name field cannot be blank"
        },
        is: {
          args: /^[a-zA-Z0-9\s]*$/,
          msg: "Last name must contain letters, numbers, and spaces only"
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Address field cannot be blank"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "Email field cannot be blank"
        },
        isEmail: {
          msg: "Email must be valid and contain a @ and a ."
        }
      }
    },
    library_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { 
          msg: "Library id field cannot be blank"
        },
        isAlphanumeric: {
          msg: "Library id must contain letters and numbers only"
        }
      }
    },
    zip_code: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "Zip code field cannot be blank"
        },
        isInt: {
          msg: "Zip code must be numbers only"
        }
      }
    }
  }, {
    timestamps: false
  });
  Patrons.associate = function(models) {
    // associations can be defined here
  };
  return Patrons;
};