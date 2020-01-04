var amqp = require('amqplib/callback_api');
const nodemailer = require("nodemailer");

const CONN_URL = 'amqp://yvgwldoi:5e1DbKDcwDYcWWUREpvfLC3t_1x5C1re@stingray.rmq.cloudamqp.com/yvgwldoi';
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
                    to: msg.content.email, // list of receivers
                    subject: 'Code for election', // Subject line
                    html: '<p> Codul tau pentru a putea vota este urmatorul: '+msg.content.uniqueCode+'</p>'// plain text body
                  };

                  transporter.sendMail(mailOptions, function (err, info) {
                    if(err)
                      console.log(err)
                    else
                      console.log(info);
                 });
        //console.log("Message:", msg.content.toString());
      },4000);
      },{ noAck: true }
    );
  });
});