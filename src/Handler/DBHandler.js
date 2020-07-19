'use strict';
const { Op } = require('sequelize')
const { Student } = require('../db/models');

class DBHandler {

  getAllStudent() {
    return Student.findAll({
      attributes: ['slack_id','slack_username', 'atcoder_username', 'highest_score', 'current_score', 'num_competitions','recent_competion'],
      order: [
        ['highest_score', 'DESC']
      ]
    })
      .then(res => {
        const data = res.map(x=>{
          const dataValues = x.dataValues
          dataValues.recent_competion = dataValues.recent_competion.toDateString()
          
          return dataValues
        })
        return data
      })
      .catch(err => console.log(err));
  };

  studentUpsert(record) {
    return Student.upsert(record).catch(err => console.log(err))
  }

  getStudentBySlack(slack_id) {
    return Student.findOne({
      where: {
        slack_id
      },
      attributes: ['slack_id', 'atcoder_username', 'highest_score', 'current_score'],
      order: [
        ['highest_score', 'DESC']
    ]
    }).catch(err => console.log(err))
  }

  getStudentInBulkForSheet(slack_ids) {
    return Student.findAll({
      where: {
        [Op.or]: [
          ...slack_ids.map(x => {
            return {
              slack_id: x
            }
          })
        ]
      },
      attributes: ['slack_username', 'atcoder_username', 'highest_score', 'current_score', 'num_competitions','recent_competion'],
      order: [
          ['highest_score', 'DESC']
      ]
    })
    .then(res => {
      const data = res.map(x=>{
        const dataValues = x.dataValues
        dataValues.recent_competion = dataValues.recent_competion.toDateString()
        
        return dataValues
      })
      return Object.values(data)
    })
      .catch(err => console.log(err))
  }

  getStudentInBulk(slack_ids) {
    const students = slack_ids.map(x => {
      return {
        slack_id: x
      }
    })
    return Student.findAll({
      where: {
        [Op.or]: [
          ...students
        ]
      },
      attributes: ['slack_id', 'atcoder_username', 'highest_score', 'num_competitions'],
      order: [
          ['highest_score', 'DESC']
      ]
    })
      .then(res => {
        const obj = {}
        for (let { dataValues } of res) {
          obj[dataValues.slack_id] = Object.values(dataValues)
        }
        return obj
      })
      .catch(err => console.log(err))
  }

  update(slack_id, record){
    return Student.update(record, {where: {
      slack_id
    }
    })
  }
}

module.exports = {
  DBHandler
};