'use strict';

module.exports = function () {
  function ActionEntity() {}

  ActionEntity.fromJSON = function (json) {
    var actionEntity = new ActionEntity();

    _.extend(actionEntity, json);
    return actionEntity;
  };

  return ActionEntity;
};
