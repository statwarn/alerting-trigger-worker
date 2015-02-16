'use strict';

module.exports = function () {
  return {
    equal: require('./condition/equal')(),
    threshold_min: require('./condition/threshold_min')(),
    threshold_max: require('./condition/threshold_max')()
  };
};
