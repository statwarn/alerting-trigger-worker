'use strict';
require(!process.env.TEST ? './bootstrap' : './bootstrap.test');

var logger = require('./helpers/logger');
var config = require('./config')(logger);

/**
 * @callback startCallback
 * @param {Object} config Application configuration
 * @param {Object} logger Logger
 * @param {Object} rabbit Wascally RabbitMQ broker
 */

/**
 * @param {startCallback} f Callback called when starting the worker
 * @param {Object}  options Options
 * @param {Boolean} options.autoSubscribeQueue
 *  If false, the AMQP queue described by config.amqp.alerting.trigger.queue will have to be subscribed manually.
 */
function getConfiguredApp(f, options) {
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
    }).catch(function (err) {
      logger.err("TriggerWorker: RabbitMQ publish error:", err);
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
    queues: [
      {name: config.amqp.alerting.trigger.queue, subscribe: options.autoSubscribeQueue}
    ],
    exchanges: [
      {name: config.amqp.alerting.trigger.exchange.name, type: config.amqp.alerting.trigger.exchange.type}
    ]
  }).done(function () {
    f(config, logger, rabbit);
  }, function (err) {
    logger.error("TriggerWorker: RabbitMQ configure error:", err);
    // Propagate the error if we can't connect to RabbitMQ
    throw err;
  });
}

function defaultAppHandler(config, logger, rabbit) {
  logger.info('TriggerWorker: Ready to trigger');
}

if (module.parent === null) {
  // The worker was directly launched
  getConfiguredApp(defaultAppHandler, {
    autoSubscribeQueue: true
  });
} else {
  // The worker was required by another module
  module.exports = getConfiguredApp;
}
