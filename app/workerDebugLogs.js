var amqp = require('amqplib/callback_api');
const nodemailer = require("nodemailer");

const CONN_URL = 'amqp://yvgwldoi:5e1DbKDcwDYcWWUREpvfLC3t_1x5C1re@stingray.rmq.cloudamqp.com/yvgwldoi';

function startConsumer(){
console.log("Consumer started");

amqp.connect(CONN_URL, function (err, conn) {
  conn.createChannel(function (err, ch) {

    ch.consume('code', function (msg) {
      
      setTimeout(function(){
        var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                           user: 'election.platform.noreplay@gmail.com',
                           pass: 'toader69'
                       }
                   });

                   const mailOptions = {
                    from: 'election.platform.noreplay@gmail.com', // sender address
                    to: JSON.parse(msg.content.toString()).email, // list of receivers
                    subject: 'Code for election', // Subject line
                    html: '<p> Codul tau pentru a putea vota este urmatorul: '+JSON.parse(msg.content.toString()).uniqueCode+'</p>'// plain text body
                  };

                  transporter.sendMail(mailOptions, function (err, info) {
                    if(err)
                      console.log(err)
                    else
                      console.log(info);
                 });
      },4000);
      },{ noAck: true }
    );
  });
});

}

module.exports = startConsumer;