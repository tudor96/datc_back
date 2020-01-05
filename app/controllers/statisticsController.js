'use strict';

const express = require('express');
const HttpError = require('../util/httpError');
const log = require('../services/logService');

const statisticsRouter = express.Router();

const router = function (statisticsService) {

    //get election results
    statisticsRouter.get('/:pollId', async (req, res, next) => {
        try {
            const result = await statisticsService.getPollStatistics(req.params.pollId);

            res.setHeader('Status', 200);
            res.sendStatus(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / voting error ${err}.`));
        }
    });

    //get election statistics per region
    statisticsRouter.get('/region/:pollId', async (req, res, next) => {
        try {
            const result = await statisticsService.getPollStatisticsRegion(req.params.pollId);

            res.setHeader('Status', 200);
            res.sendStatus(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / voting error ${err}.`));
        }
    });

    //get election statistics per sex
    statisticsRouter.get('/sex/:pollId', async (req, res, next) => {
        try {
            const result = await statisticsService.getPollStatisticsPerSex(req.params.pollId);

            res.setHeader('Status', 200);
            res.sendStatus(result);
        } catch (err) {
            log.error(JSON.stringify(err));
            return next(new HttpError(500, `GET / voting error ${err}.`));
        }
    });

    return statisticsRouter;
};

module.exports = router;