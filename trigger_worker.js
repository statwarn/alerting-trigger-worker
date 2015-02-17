'use strict';
require(!process.env.TEST ? './bootstrap' : './bootstrap.test');

var logger = require('./helpers/logger');
var config = require('./config')(logger);
var operators = require('./src/operators')();
var domain = require('./src/domain')(config, logger, operators);

var MessageHandler = require('./src/message_handler')(logger, config, domain.AlertRepository, domain.MeasurementEntity);
var messageHandler = new MessageHandler();

// Consts
assert(_.isString(config.statwarn.schema.monitoring.create));
var SCHEMA_MONITORING_CREATE = config.statwarn.schema.monitoring.create;
var SCHEMA_ALERTS_TRIGGERED = config.statwarn.schema.alerts.triggered;

// connect on amqp
var rabbit = require('wascally');
// after this call, any new callbacks attached via handle will be wrapped in a try/catch
// that nacks the message on an error
rabbit.nackOnError();

/**
 * Event handler called when an action is triggered (event 'action:new' on message_handler)
 * @param {Object} data
 * @param {Object} data.action Action triggered
 * @param {Object} data.alert Alert related to the triggered action
 * @param {Object} data.measurement Measurement which caused the trigger
 */
function handleActionTriggered(data) {
  rabbit.publish(config.amqp.alerting.trigger.exchange, {
    routingKey: config.amqp.alerting.trigger.routing_key.prefix + data.alert.alert_id,
    body: {
      measurement: data.measurement,
      action: data.action,
      alert: data.alert
    },
    type: SCHEMA_ALERTS_TRIGGERED
  }).then(function () {
    console.log("published");
  }).catch(function (err) {
    console.err("rabbit publish err:", err);
  });
}

// Publish triggered actions on RabbitMQ
messageHandler.on('action:new', handleActionTriggered);

rabbit
  .handle(SCHEMA_MONITORING_CREATE, messageHandler.handle.bind(messageHandler))['catch'](function (err, msg) {
    logger.error(err);
    // do something with the error & message
    msg.nack();
  });

rabbit.configure({
  connection: config.amqp,
  exchanges: [
    {name: "statwarn", type: "topic"}
  ]
}).then(function () {
  logger.info('Ready to trigger.');
  // ready to go!
}).catch(function (err) {
  logger.error("RabbitMQ configure error:", err);
  // Crash the app if we can't connect to RabbitMQ
  process.exit(1);
});
