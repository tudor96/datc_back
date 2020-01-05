'use strict';

const express = require('express');
const HttpError = require('../util/httpError');
const log = require('../services/logService');

const electionRouter = express.Router();

const router = function (electionService) {


    //insert partid
    electionRouter.post('/partid', async (req, res, next) => {
        try {
            let result = await electionService.insertPoliticalParty(req.body.name, req.body.description);

            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `POST / partid error ${err}.`));
        }
    });

    //get political parties
    electionRouter.get('/partid', async (req, res, next) => {
        try {
            let result = await electionService.getPoliticalParties();

            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / partid error ${err}.`));
        }
    });

    // get regions
    electionRouter.get('/regions', async (req, res, next) => {
        try {

            const result = await electionService.getRegions();

            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / regions error ${err}.`));
        }
    });

    // get polls
    electionRouter.get('/', async (req, res, next) => {
        try {
            const result = await electionService.getPolls();

            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / error ${err}.`));
        }
    });

    // get poll by id
    electionRouter.get('/:id', async (req, res, next) => {
        try {
            const result = await electionService.getPoll(req.params.id);

            res.setHeader('Status', 200);
            res.send(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET /:id error ${err}.`));
        }
    });

    //insert poll
    electionRouter.post('/', async (req, res, next) => {
        try {
            let result = await electionService.insertPoll(req.body);
            //result = await electionService.getPoll(result);

            res.setHeader('Status', 200);
            res.send({"pollInserted": result});
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `POST / error ${err}.`));
        }
    });

    return electionRouter;
};

module.exports = router;