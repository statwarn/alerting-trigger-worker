'use strict';

module.exports = function (config, logger, operators) {
  var ActionEntity = require('./ActionEntity')();
  var TriggerEntity = require('./TriggerEntity')();
  var AlertEntity = require('./AlertEntity')(logger, operators, ActionEntity, TriggerEntity);
  var MeasurementEntity = require('./MeasurementEntity')();

  var AlertRepository = require('./AlertRepository')(config, logger, AlertEntity);

  return {
    ActionEntity: ActionEntity,
    TriggerEntity: TriggerEntity,
    AlertEntity: AlertEntity,
    MeasurementEntity: MeasurementEntity,

    AlertRepository: AlertRepository
  }
};
