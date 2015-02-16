'use strict';

module.exports = function () {
  function Measurement(id, data, metadata) {

  }

  Measurement.fromJSON = function (measurement) {
    // currently we simply forward the object
    return measurement;
  };

  return Measurement;
};
