'use strict';
require(!process.env.TEST ? './bootstrap' : './bootstrap.test');

var logger = require('./helpers/logger');
var config = require('./config')(logger);

// load operators
var operators = require('./src/operators');

// connect on amqp
var rabbit = require('wascally');
// listen on amqp

// - ask
// for alerts from API - listen on amqp -

// after this call, any new callbacks attached via handle will be wrapped in a try/catch
// that nacks the message on an error
rabbit.nackOnError();

var handler = rabbit.handle('company.project.messages.logEntry', function (message) {
  PK: monitoring. {
    id
  }

  Message: {
    id: '',
    created: timestamp,
    type: 'monitoring.new',

  }
  // get alerts for the current monitoring point
  AlertRepository.getFor()
  console.log(message.body);
  message.ack();
});

handler.
catch (function (err, msg) {
  // do something with the error & message
  msg.nack();
});


rabbit.configure({
  connection: config.amqp
}).done(function () {

  // ready to go!
});
