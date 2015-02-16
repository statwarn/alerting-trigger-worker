'use strict';

module.exports = function (logger, config, AlertRepository, MeasurementEntity) {
  // load operators
  var operators = require('./operators');


  return {
    /**
     * Handle a message from RabbitMQ
     * @param  {Object} message message format will be "application/vnd.com.statwarn.monitoring.create.v1+json"
     */
    handle: function (message) {
      var measurement = message.data;

      // Postulat: the monitoring-api never send inconsistent/broken monitoring message
      // thus we don't have measurement format here.

      AlertRepository.getTriggeredActionsForMeasurement(MeasurementEntity.fromJSON(measurement), function (err, actions) {
        if (err) {
          // requeue this message
          logger.error(err);
          return message.nack();
        }

        actions.forEach(function () {
          // publish des actions séparées sur rabbitmq
        });

        message.ack();
      });
    }
  }

};
