'use strict';

module.exports = function () {
  return {
    AlertEntity: require('./AlertEntity')(),
    MeasurementEntity: require('./MeasurementEntity')(),

    AlertRepository: require('./AlertRepository')(),
  }
};
