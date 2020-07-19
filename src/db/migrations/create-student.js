'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Students', {
      slack_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      atcoder_username: {
        type: Sequelize.STRING
      },
      slack_username: {
        type: Sequelize.STRING
      },
      highest_score: {
        type: Sequelize.INTEGER
      },
      current_score: {
        type: Sequelize.INTEGER
      },
      num_competitions: {
        type: Sequelize.INTEGER
      },
      recent_competion: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Students');
  }
};