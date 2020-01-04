const log = require('../services/logService');

function wrapAsync(f) {
  return function(req, res, next) {
    f(req, res, next).catch((err) => {
      log.error(`Error ${err.message}`);
      next(err, req, res);
    });
  };
}

module.exports = wrapAsync;
