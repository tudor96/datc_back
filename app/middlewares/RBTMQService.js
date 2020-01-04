const amqp = require('amqplib/callback_api');

const CONN_URL = 'amqp://yvgwldoi:5e1DbKDcwDYcWWUREpvfLC3t_1x5C1re@stingray.rmq.cloudamqp.com/yvgwldoi';
//let ch = null;

const amqpModule = (function (){
  let instance = null;
  let ch = null
  function amqpService(){
      this.connect = function(){
          amqp.connect(CONN_URL, function (err, conn) {
              conn.createChannel(function (err, channel) {
                console.log("here")
                 ch = channel;
              });
           });
      },
      this.publish = async function(queueName, data){
          if (ch === null){
              amqp.connect(CONN_URL, function (err, conn) {
                  conn.createChannel(function (err, channel) {
                    console.log("here")
                     ch = channel;
                    console.log(ch)

                     ch.sendToQueue(queueName, new Buffer(data));
                  });
               });
          }
          ch.sendToQueue(queueName, new Buffer(data));
      },
      this.close = function(){
          ch.close();
      }
    }
    return {
      getInstance: function() {
        if (instance === null) {
          instance = new amqpService();
        }
        return instance;
      },
    };

})();

module.exports = amqpModule.getInstance()