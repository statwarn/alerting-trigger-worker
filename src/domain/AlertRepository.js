'use strict';

var request = require('requestretry');

module.exports = function (config, logger, AlertEntity) {
  function AlertRepository() {}

  /**
   * Retrieve every alerts that match the measurement
   * @param  {String} measurement_id
   * @param  {Function} f(err: PrettyError, alerts: Array)
   */
  AlertRepository.findByMeasurementId = function (measurement_id, f) {
    // /v1/alerts?measurement_id=
    var endpoint = config.statwarn.alerting.api.endpoint + "/v1/alerts";
    var queryString = {
      measurement_id: measurement_id
    };

    logger.info("AlertRepository: GET " + endpoint + "?" + _(queryString).pairs().invoke("join", "=").valueOf().join("&"));
    request({
      url: endpoint,
      qs: queryString,
      json: true
    }, function (err, data) {
      f(err, err ? null : data.body.map(AlertEntity.fromJSON));
    });
  };

  /**
   * Retrieve every alerts that match the measurement
   * @param  {Measurement} measurement
   * @param  {Function} f(err: PrettyError, actionsPerAlert: [{actions: Array, alert: Object}])
   *                    err: if any occurred
   *                    actionsPerAlert: an array (empty or not) of triggered actions with their related alert
   */
  AlertRepository.getTriggeredActionsForMeasurement = function (measurement, f) {
    // /v1/alerts/:alertId?measurement_id=&measurement_id=
    // , alerts: Array
    this.findByMeasurementId(measurement.id, function (err, alerts) {
      if (err) {
        // forward findByMeasurement error
        return f(err);
      }

      function checkAlert(measurement, alert, f) {
        alert.match(measurement, function (err, actions) {
          if (err) {
            f(err);
          } else {
            f(null, {
              alert: alert,
              triggeredActions: actions
            });
          }
        });
      }

      /**
       * Called once we got each alert's actions
       * @param  {PrettyError,null} err
       * @param  {Array} actionsPerAlert [{alert: ..., triggeredActions: []}, ...]
       */
      function done(err, actionsPerAlert) {
        if (err) {
          return f(new PrettyError(500, "At least one alert yield an error", err));
        }

        f(null, actionsPerAlert);
      }

      // loop asynchronously through each alert and execute them
      // then retrieve the actions {Action} to send
      async.map(alerts, _.partial(checkAlert, measurement), done);
    });
  };

  return AlertRepository;

};
