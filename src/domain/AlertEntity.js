'use strict';

module.exports = function (logger, operators, ActionEntity, TriggerEntity) {
  function AlertEntity() {}

  /**
   * Check if the alert should be triggered for the given measurement.
   * @param {Object} measurement
   * @param {Function} f
   */
  AlertEntity.prototype.match = function (measurement, f) {
    // 1. Iterate over each trigger for this alert
    // 2. Find the trigger's operator's implementation using the operator_id
    // 3.1 If the operator is found, call it with the measurement data, the target, and the operator configuration
    // 3.2 If the operator is not found, ignore it and consider it matched
    // 4. If all operators matched, the alert matches
    var applyTriggerOperatorIfValid = function (trigger, f) {
      var operator = operators[trigger.operator_id];

      // If the operator is not found, ignore it and consider it matched
      if (!operator) {
        logger.warn("AlertEntity.match: trigger with invalid/unsupported operator_id '" + trigger.operator_id + "' for alert '" + this.alert_id + "'");
        return f(null, true);
      }

      operator.applyToData(measurement.data, trigger.target_value, trigger.operator_configuration, f, measurement);
    }.bind(this);

    // Iterate over each trigger and check if it matches the measurement
    async.map(this.triggers, applyTriggerOperatorIfValid, function (err, triggersMatch) {
      if (err) {
        return f(err);
      }
      f(null, _.all(triggersMatch) ? this.actions : []);
    }.bind(this));
  };

  AlertEntity.fromJSON = function (json) {
    var alertEntity = new AlertEntity();
    var jsonFields = ["alert_id", "name", "activated", "measurement_id"];

    _.extend(alertEntity, _.pick(json, jsonFields));
    alertEntity.triggers = _.map(json.triggers, TriggerEntity.fromJSON);
    alertEntity.actions = _.map(json.actions, ActionEntity.fromJSON);
    return alertEntity;
  };

  return AlertEntity;
};
