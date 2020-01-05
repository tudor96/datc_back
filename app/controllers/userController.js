'use strict';

const express = require('express');
const HttpError = require('../util/httpError');
const log = require('../services/logService');
const code = require('../middlewares/uniqueCodeService');

const userRouter = express.Router();

const router = function (userService) {

    // get all info about all users
    userRouter.get('/', async (req, res, next) => {
        try {
            let params = {
                cnp: req.query.cnp,
                username: req.query.username,
                email: req.query.email
            }
            const users = await userService.getUsers(params);

            res.setHeader('Status', 200);
            res.send(users);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / user error ${err}.`));
        }
    });

    //get user based on id
    userRouter.get('/:id', async (req, res, next) => {
        try {
            const users = await userService.getUser(req.params.id);
            res.setHeader('Status', 200);
            res.send(users);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET /:id user error ${err}.`));
        }
    });

    //insert new user
    userRouter.post('/', async (req, res, next) => {
        try {
            const resultInsert = await userService.insertUser(req.body.firstname, req.body.lastname, req.body.username, req.body.email, req.body.cnp, req.body.adresa, req.body.sex, req.body.idJudet);
            let result = await userService.getUser(resultInsert.insertId);

            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `POST / user error ${err}.`));
        }
    });

    //sign up for vote
    userRouter.post('/signUp', async (req, res, next) => {
        try {
            function uuidv4() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            let uniqueCode = uuidv4();
            const result = await userService.signUpForPoll(req.authenticatedUser.id, req.body.pollId, uniqueCode);
            
            if (result[0] !== undefined) {
                code.sendCode(JSON.stringify({"uniqueCode": uniqueCode,
                email: req.authenticatedUser.email}));

                res.setHeader('Status', 200);
                res.send(uniqueCode);
            }
            else {
                return next(new HttpError(403, `Already signed up!`));
            }
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `POST /signUp user error ${err}.`));
        }
    });

    //vote
    userRouter.put('/vote', async (req, res, next) => {
        try {
            const result = await userService.vote(req.authenticatedUser.id, req.body.idQuestion, req.body.uniqueCode, req.body.optionId);
            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            if(err.includes("Already")){
                return next(new HttpError(403, err));
            }
            else{
            return next(new HttpError(500, `PUT /vote user error ${err}.`));
            }
        }
    });

    //change admin role
    userRouter.put('/admin/:id', async (req, res, next) => {
        try {
            const result = await userService.changeAdminRole(req.params.id, req.body.isAdmin);
            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `PUT /vote user error ${err}.`));
        }
    });

    return userRouter;
};

module.exports = router;