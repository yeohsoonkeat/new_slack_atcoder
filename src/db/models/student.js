'use strict';
module.exports = (Sequelize, DataTypes) => {
  const Student = Sequelize.define('Student', {
    slack_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    atcoder_username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slack_username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    highest_score: {
      type: DataTypes.INTEGER
    },
    current_score: {
      type: DataTypes.INTEGER
    },
    num_competitions: {
      type: DataTypes.INTEGER
    },
    recent_competion: {
      type: DataTypes.DATE
    },
  }, {});
  Student.associate = function (models) {
    // associations can be defined here
  };
  return Student;
};