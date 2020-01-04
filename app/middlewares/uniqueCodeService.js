'use strict';
const publishToQueue = require('./RBTMQService');

const UniqueCodeService = (function() {
  let instance = null;
  function Code(){
    this.sendCode = function(message){
    publishToQueue.publish("code", message);
    }
  }
  return {
    getInstance: function() {
      if (instance === null) {
        instance = new Code();
      }
      return instance;
    },
  };
})();

module.exports = UniqueCodeService.getInstance();
