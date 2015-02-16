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

    request({
      url: endpoint,
      qs: {
        measurement_id: measurement_id
      },
      json: true
    }, function (err, data) {
      f(err, err ? null : data.body.map(AlertEntity.fromJSON));
    });
  };

  /**
   * Retrieve every alerts that match the measurement
   * @param  {Measurement} measurement
   * @param  {Function} f(err: PrettyError, actions: Array)
   *                    err: if any occurred
   *                    actions: an array (empty or not) of triggered action
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
        alert.match(measurement, f);
      }

      /**
       * Called once we got each alert's actions
       * @param  {PrettyError,Null}   err             [description]
       * @param  {Array}   actionsPerAlertsIndex [[action1, action2,...], [action3, action4,...]]
       */
      function done(err, actionsPerAlertsIndex) {
        if (err) {
          return f(new PrettyError(500, "At least one alert yield an error", err));
        }

        f(null, _.flatten(actionsPerAlertsIndex));
      }

      // loop asynchronously through each alert and execute them
      // then retrieve the actions {Action} to send
      async.map(alerts, _.partial(checkAlert, measurement), done);
    });
  };

  return AlertRepository;

};
