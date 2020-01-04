'use strict';
const crypto = require('crypto');
const ews = require('ews-javascript-api');

const log = require('./logService');

function StatisticsService(config, dbService) {
  this._dbService = dbService;
  this._config = config;
}

StatisticsService.prototype.getPollStatistics = async function (pollId) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT questionId from pollquestion where pollId = ?`;
      let result = await this._dbService.query(sql, [pollId]);

      if(result == -1){
        return resolve([]);
      }
      let questions = [];
      result.forEach(res => {
        questions.push(res.questionId);
      })

      console.log(questions)

      sql = 'SELECT id, name, sum(votes) as votes from `option` where questionId in (' + `${questions}` +') group by id';
      result = await this._dbService.query(sql, []);

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};

StatisticsService.prototype.getPollStatisticsRegion = async function (pollId) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT questionId from pollquestion where pollId = ?`;
      let result = await this._dbService.query(sql, [pollId]);

      if(result == -1){
        return resolve([]);
      }
      let questions = [];
      result.forEach(res => {
        questions.push(res.questionId);
      })

      sql = 'SELECT count(u.id) as votes, j.name  from user u, votes v, judet j where v.idQuestion in (' + `${questions}` +') and v.voted = 1 and v.idUser = u.id and u.idJudet = j.id group by idJudet';
      result = await this._dbService.query(sql, []);

      if(result === -1){
        result = [];
      }

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};

StatisticsService.prototype.getPollStatisticsPerSex = async function (pollId) {
  return new Promise(async (resolve, reject) => {
    try {
      let sql = `SELECT questionId from pollquestion where pollId = ?`;
      let result = await this._dbService.query(sql, [pollId]);

      if(result == -1){
        return resolve([]);
      }
      let questions = [];
      result.forEach(res => {
        questions.push(res.questionId);
      })

      sql = 'SELECT count(u.id) as votes, u.sex  from user u, votes v where v.idQuestion in (' + `${questions}` +') and v.voted = 1 and v.idUser = u.id group by sex';
      result = await this._dbService.query(sql, []);

      if(result === -1){
        result = [];
      }

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};



module.exports = StatisticsService;
