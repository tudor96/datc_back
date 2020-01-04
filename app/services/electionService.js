'use strict';
const crypto = require('crypto');
const ews = require('ews-javascript-api');

const log = require('./logService');

function ElectionService(config, dbService) {
  this._dbService = dbService;
  this._config = config;
}

ElectionService.prototype.getPolls = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT id, name, description, startDate, endDate from poll where startDate > ?`;
      let result = await this._dbService.query(sql, [new Date()]);

      let final = Promise.all(result.map(async poll => {
        sql = `SELECT id, name from question, pollquestion where pollId = ? and id = questionId`;
        let responseQuestions = await this._dbService.query(sql, [poll.id]);
        poll["questions"] = responseQuestions;
        return Promise.all(poll.questions.map(async question => {
          
          sql = 'SELECT id, name from `option` where questionId = ?';
          let responseOptions = await this._dbService.query(sql, [question.id]);
          question["options"] = responseOptions;
          return Promise.resolve(poll);
        }))
      }))

      return resolve(final);
    } catch (err) {
      return reject(err);
    }
  });
};

ElectionService.prototype.getRegions = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT * from judet`;
      let result = await this._dbService.query(sql, []);

      if(result === -1){
        result = []
      }
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};

ElectionService.prototype.getPoll = async function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT id, name, description, startDate, endDate from poll where startDate > ? and id = ?`;
      let result = await this._dbService.query(sql, [new Date(), id]);
      let final = Promise.all(result.map(async poll => {
        sql = `SELECT id, name from question, pollquestion where pollId = ? and id = questionId`;
        let responseQuestions = await this._dbService.query(sql, [poll.id]);
        poll["questions"] = responseQuestions;
        return Promise.all(poll.questions.map(async question => {
          
          sql = 'SELECT id, name from `option` where questionId = ?';
          let responseOptions = await this._dbService.query(sql, [question.id]);
          question["options"] = responseOptions;
          return Promise.resolve(poll);
        }))
      }))

      return resolve(final);
    } catch (err) {
      return reject(err);
    }
  });
};

ElectionService.prototype.insertPoll = async function (poll) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `INSERT into poll(name,description,startDate,endDate) values (?,?,?,?)`;
      let result = await this._dbService.query(sql, [poll.name, poll.description, poll.startDate, poll.endDate]);
      let pollId = result.insertId;
      let questionsIds = [];
      Promise.all(poll.questions.forEach(async question => {
        sql = `INSERT into question (name) values(?)`;
        let responseQuestions = await this._dbService.query(sql, [question.name]);
        sql = `INSERT into pollquestion values(?,?)`;
        let responsePollQuestions = await this._dbService.query(sql, [pollId, responseQuestions.insertId]);
        questionsIds.push(responseQuestions.insertId);
        Promise.all(question.options.forEach(async option => {
          sql = 'INSERT into `option` (name, questionId, votes) values(?,?,?)';
          let responseOptions = await this._dbService.query(sql, [option.name, responseQuestions.insertId, 0]);
          return Promise.resolve();
        }))
        return Promise.resolve();
      }))


      return resolve(pollId);
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = ElectionService;
