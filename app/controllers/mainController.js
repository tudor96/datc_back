'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const HttpError = require('../util/httpError');
const StatisticsController = require('./statisticsController');
const ElectionController = require('./ElectionController');
const UserController = require('./userController');
const wrapAsync = require('../middlewares/wrapAsync');

module.exports = function (log, dbService, config, userService) {
    const app = express();

    // cors
    // =============================================================================
    const corsOptions = {
        origin: config.webServer.corsAllowed,
        optionsSuccessStatus: 200,
        credentials: true,
    };

    app.use(cors(corsOptions));

    // frontend
    // =============================================================================
    app.use(express.static('www'));

    // authentication
    // =============================================================================
    app.all('*', async (req, res, next) => {
        try {
            let cnp = req.headers["x-user-cnp"];
            //  console.log(req)
            if (cnp) {
                let params = {
                    cnp: cnp,
                    username: null,
                    email: null,
                }

                let result = await userService.getUsers(params);
                req.authenticatedUser = result[0];
                next();
            }
            else {
                if (req.url.includes("/user") && req.method === "POST") {
                    next();
                }
                else {
                    return next(new HttpError(401, `Unauthorized`));
                }
            }
        }
        catch (err) {
            log.error(err)
            return next(new HttpError(401, `Unauthorized`));
        }
    })
    // ============================================================================

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false,
    }));

    // register context
    // =============================================================================
    const statisticsService = new (require('../services/statisticsService'))(config, dbService);
    const electionService = new (require('../services/electionService'))(config, dbService);
    //const userService = new(require('../services/userService'))(config, dbService);
    app.use(config.endpoints.statisticsContext, new StatisticsController(statisticsService));
    app.use(config.endpoints.electionContext, new ElectionController(electionService));
    app.use(config.endpoints.userContext, new UserController(userService));

    // middlewares
    // =============================================================================
    app.use(require('./../middlewares/errorLogging')());
    app.use(require('./../middlewares/errorJsonResponse')());

    return app;
};