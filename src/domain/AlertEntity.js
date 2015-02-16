'use strict';

module.exports = function (logger, operators, ActionEntity, TriggerEntity) {
  function AlertEntity() {}

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
