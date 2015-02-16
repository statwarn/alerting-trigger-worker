'use strict';

module.exports = function () {
  function MeasurementEntity(id, data, metadata) {}

  MeasurementEntity.fromJSON = function (measurement) {
    // currently we simply forward the object
    return measurement;
  };

  return MeasurementEntity;
};
