'use strict';

const log = require('./app/services/logService');
const configService = require('./app/services/configurationService');
const dbService = new(require('./app/services/dbService'))(configService.config);
const userService = new(require('./app/services/userService'))(configService.config, dbService);

const https = require('https');
const http = require('http');
const fs = require('fs');

const options = {
    key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/cert.pem'),
    passphrase: configService.config.webServer.passphrase,
};


const app = require('./app/controllers/mainController')(
    log,
    dbService,
    configService.config,
    userService
);

// PORT is either provided as cli param, or read from config
// =============================================================================
const HTTP_PORT = process.env.PORT || configService.config.webServer.httpport;
const HTTPS_PORT = process.env.PORT || configService.config.webServer.httpsport;

// START THE SERVER
// =============================================================================
if (HTTP_PORT) {
    const server = http.createServer(app).listen(HTTP_PORT, function() {
        log.debug(`Server started on http port:  ${HTTP_PORT} ....`);
    });
    server.timeout = configService.config.webServer.serverTimeout;
}

if (HTTPS_PORT) {
    const server = https.createServer(options, app).listen(HTTP_PORT, function() {
        log.debug(`Server started on https port:  ${HTTP_PORT} ....`);
    });
    server.timeout = configService.config.webServer.serverTimeout;
}

// SIGNAL HANDLERS
// =============================================================================
function gracefulShutdownHandler() {
    const msg = `Shutting down gracefully ...`;
    log.debug(msg);

    dataService.closeConnections().finally(() => {
        process.exit(0);
    });
}
process.on('SIGTERM', gracefulShutdownHandler);

process.on('unhandledRejection', (reason) => {
    log.debug(reason.stack || reason);
    console.log('Unhandled Rejection at:', reason.stack || reason);
});

process.on('uncaughtException', (reason, promise) => {
    log.debug(reason.stack || reason);
    console.log('Unhandled Exception at:', reason.stack || reason);
});