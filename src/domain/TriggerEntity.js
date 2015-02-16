'use strict';

module.exports = function () {
  function TriggerEntity() {}

  TriggerEntity.fromJSON = function (json) {
    var triggerEntity = new TriggerEntity();

    _.extend(triggerEntity, json);
    return triggerEntity;
  };

  return TriggerEntity;
};
