'use strict';
require(!process.env.TEST ? './bootstrap' : './bootstrap.test');

var logger = require('./helpers/logger');
var config = require('./config')(logger);

var message_handler = require('./src/message_handler')(config);

// Consts
assert(_.isString(config.statwarn.schema.monitoring.create));
var SCHEMA_MONITORING_CREATE = config.statwarn.schema.monitoring.create;

// connect on amqp
var rabbit = require('wascally');
// after this call, any new callbacks attached via handle will be wrapped in a try/catch
// that nacks the message on an error
rabbit.nackOnError();

rabbit
  .handle(SCHEMA_MONITORING_CREATE, message_handler.handle)['catch'](function (err, msg) {
    logger.error(err);
    // do something with the error & message
    msg.nack();
  });

rabbit.configure({
  connection: config.amqp
}).done(function () {
  logger.info('Ready to trigger.');
  // ready to go!
});
