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
      let sql = `SELECT id, name, description, startDate, endDate from poll`;
      let result = await this._dbService.query(sql, []);
      if (result !== -1) {
        let final = Promise.all(result.map(async poll => {
          sql = `SELECT id, name from question, pollquestion where pollId = ? and id = questionId`;
          let responseQuestions = await this._dbService.query(sql, [poll.id]);
          poll["questions"] = responseQuestions;
          await Promise.all(poll.questions.map(async (question, index) => {
            sql = 'SELECT o.id, o.name, o.description, p.name as partidName from `option` o, partid p where questionId = ? and o.idPartid = p.id';
            let responseOptions = await this._dbService.query(sql, [question.id]);
            question["options"] = responseOptions;
          }))
          return Promise.resolve(poll);
        }))
        return resolve(final);
      }
      else {

        return resolve([]);
      }

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

      if (result === -1) {
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
      if (result !== -1) {
        let final = Promise.all(result.map(async poll => {
          sql = `SELECT id, name from question, pollquestion where pollId = ? and id = questionId`;
          let responseQuestions = await this._dbService.query(sql, [poll.id]);
          poll["questions"] = responseQuestions;
          await Promise.all(poll.questions.map(async question => {
            sql = 'SELECT o.id, o.name, o.description, p.name as partidName from `option` o, partid p where questionId = ? and o.idPartid = p.id';
            let responseOptions = await this._dbService.query(sql, [question.id]);
            question["options"] = responseOptions;
          }))
          return Promise.resolve(poll);
        }))

        return resolve(final);
      }
      else {
        return resolve([]);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

ElectionService.prototype.insertPoll = async function (poll) {
  return new Promise(async (resolve, reject) => {
    try {
     // console.log(poll)
      let sql = `INSERT into poll(name,description,startDate,endDate) values (?,?,?,?)`;
      let startDate = poll.startDate.split("T")[0] + " " + poll.startDate.split("T")[1].split(".")[0];
      let endDate = poll.endDate.split("T")[0] + " " + poll.endDate.split("T")[1].split(".")[0];
      let result = await this._dbService.query(sql, [poll.name, poll.description, startDate, endDate]);
      let pollId = result.insertId;
      let questionsIds = [];
      console.log("1 ", poll.questions);
      await Promise.all(poll.questions.map(async question => {
        sql = `INSERT into question (name) values(?)`;
        let responseQuestions = await this._dbService.query(sql, [question.name]);
        sql = `INSERT into pollquestion values(?,?)`;
        let responsePollQuestions = await this._dbService.query(sql, [pollId, responseQuestions.insertId]);
        questionsIds.push(responseQuestions.insertId);
        console.log("2 ", question.options);

        await Promise.all(question.options.map(async option => {
          sql = 'INSERT into `option` (name, questionId, votes, description, idPartid) values(?,?,?,?,?)';
          let responseOptions = await this._dbService.query(sql, [option.name, responseQuestions.insertId, 0, option.description, option.idPartid]);
          //return Promise.resolve();
        }))
        return Promise.resolve(question);
      }))


      return resolve(pollId);
    } catch (err) {
      return reject(err);
    }
  });
};

ElectionService.prototype.insertPoliticalParty = async function (name, description) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `INSERT into partid(name, description) values (?, ?)`;
      let result = await this._dbService.query(sql, [name, description]);

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};

ElectionService.prototype.getPoliticalParties = async function () {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT * from partid where id != 1`;
      let result = await this._dbService.query(sql, []);

      if (result === -1) {
        result = [];
      }

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = ElectionService;
