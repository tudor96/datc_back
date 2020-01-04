'use strict';
const crypto = require('crypto');
const ews = require('ews-javascript-api');

const log = require('./logService');

function UserService(config, dbService) {
    this._dbService = dbService;
    this._config = config;
}

UserService.prototype.getUsers = async function(params) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT * FROM user `;
            let uniqueParam = null;
            if(params.cnp || params.username || params.email){
                sql += `WHERE `;
                Object.keys(params).forEach(param => {
                    if(params[param]){
                        sql += ``+ param + ` = ?`; 
                        uniqueParam = params[param];
                        return;
                    }
                })
            }      
            let response = await this._dbService.query(sql, uniqueParam);
            if (response == -1) {
                return resolve([]);
            } else {
                return resolve(response);
            }
        } catch (err) {
            return reject(err);
        }
    });
};

UserService.prototype.getUser = async function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT * FROM user where id = ?`;
          
            let response = await this._dbService.query(sql, id);
            if (response == -1) {
                return resolve([]);
            } else {
                return resolve(response);
            }
        } catch (err) {
            return reject(err);
        }
    });
};

UserService.prototype.insertUser = async function(firstname, lastname, username, email, cnp, adresa,sex,idJudet) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `INSERT into user(firstname,lastname,username,email,cnp,adresa,sex,idJudet) values(?,?,?,?,?,?,?,?)`;
            let response = await this._dbService.query(sql, [firstname, lastname, username, email, cnp, adresa, sex, idJudet]);

            if (response == -1) {
                return resolve([]);
            } else {
                return resolve(response);
            }
        } catch (err) {
            return reject(err);
        }
    });
};

UserService.prototype.signUpForPoll = async function(idUser, pollId, uniqueCode) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT questionId from pollquestion where pollId = ?`;
            let response = await this._dbService.query(sql, [pollId]);

            let final = Promise.all(response.map(async question => {
                sql = `INSERT into votes values(?,?,?,?)`;
                response = await this._dbService.query(sql, [idUser, question.questionId, 0, uniqueCode]).catch(err => {
                    return reject(err);
                })
                return Promise.resolve(response);
            }))
            
            return resolve(final);
        } catch (err) {
            return reject(err);
        }
    });
};

UserService.prototype.vote = async function(idUser, idQuestion, uniqueCode, optionId) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT uniqueCode from votes where idUser = ? and uniqueCode = ? and idQuestion = ?`;
            let response = await this._dbService.query(sql, [idUser, uniqueCode, idQuestion]);
            console.log(sql);
            if(response === -1){
                return reject("Possible invalid code!");
            }

            sql = `SELECT * from votes where idQuestion = ? and idUser = ?`;
            response = await this._dbService.query(sql, [idQuestion, idUser]);

            if(response[0].voted == 1){
                return reject("Already voted!");
            }
            
            sql = `UPDATE votes set voted = ? where idQuestion = ? and idUser = ? and voted = 0`;
            response = await this._dbService.query(sql, [1, idQuestion, idUser]);

            sql = 'UPDATE `option` set votes = votes + 1 where id = ?';
            response = await this._dbService.query(sql, [optionId]);

            return resolve("Voted Successfully!");
        } catch (err) {
            return reject(err);
        }
    });
};

UserService.prototype.changeAdminRole = async function(idUser, isAdmin) {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `UPDATE user set isAdmin = ? where id = ?`;
            let response = await this._dbService.query(sql, [isAdmin, idUser]);
            if(response){
                return resolve("Admin Role Changed Successfully!");
            }
            else{
                return reject("Something went wrong!");
            }
        } catch (err) {
            return reject(err);
        }
    });
};

module.exports = UserService;