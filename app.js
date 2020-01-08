'use strict';
var express = require('express');
var serveStatic = require('serve-static');
const log = require('./app/services/logService');
const configService = require('./app/services/configurationService');
const dbService = new(require('./app/services/dbService'))(configService.config);
const userService = new(require('./app/services/userService'))(configService.config, dbService);
const consumer = require(`./app/workerDebugLogs`);
const http = require('http');
const path = require('path')
const app = require('./app/controllers/mainController')(
    log,
    dbService,
    configService.config,
    userService
);

app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'Frontend/build', 'index.html'));
  });
// PORT is either provided as cli param, or read from config
// =============================================================================
const HTTP_PORT = process.env.PORT || configService.config.webServer.httpport;

// START THE SERVER
// =============================================================================
if (HTTP_PORT) {
    const server = http.createServer(app).listen(HTTP_PORT, function() {
        log.debug(`Server started on http port:  ${HTTP_PORT} ....`);
    });
    server.timeout = configService.config.webServer.serverTimeout;
}

//start the consumer
consumer();

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