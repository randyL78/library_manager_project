'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Patrons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      library_id: {
        type: Sequelize.STRING
      },
      zip_code: {
        type: Sequelize.NUMBER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Patrons');
  }
};