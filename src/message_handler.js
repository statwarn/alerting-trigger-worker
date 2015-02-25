'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function (logger, config, AlertRepository, MeasurementEntity) {
  function MessageHandler() {}

  util.inherits(MessageHandler, EventEmitter);

  MessageHandler.prototype.handle = function (message) {
    logger.info("Handling message: " + JSON.stringify(message));

    var measurement = message.body.data;

    // Postulat: the monitoring-api never send inconsistent/broken monitoring message
    // thus we don't have measurement format here.

    AlertRepository.getTriggeredActionsForMeasurement(MeasurementEntity.fromJSON(measurement), function (err, actionsPerAlert) {
      if (err) {
        // requeue this message
        logger.error(err);
        return message.nack();
      }

      _.forEach(actionsPerAlert, function (actionAndAlerts) {
        var alert = actionAndAlerts.alert;

        _.forEach(actionAndAlerts.triggeredActions, function (action) {
          this.emit('action:new', {
            action: action,
            alert: alert,
            measurement: measurement
          });
        }, this)
      }, this);

      message.ack();
    }.bind(this));
  };

  return MessageHandler;
};
