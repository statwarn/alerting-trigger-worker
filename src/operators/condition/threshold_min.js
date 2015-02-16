'use strict';

module.exports = function () {
  function OperatorThresholdMin() {}

  /**
   * Apply the operator 'threshold_min' to the given measurement data, using a target value and operator configuration
   * @param {Object}   data          Measurement data
   * @param {String}   targetValue   Target value, e.g. "data.foo"
   * @param {Object}   configuration Operator configuration
   * @param {Function} f             Callback, called with (err, match), match being true or false depending if the condition matched
   */
  OperatorThresholdMin.applyToData = function (data, targetValue, configuration, f) {
    // Check if the target is valid
    if (targetValue === "data" || !_.startsWith(targetValue, "data.")) {
      return f(new PrettyError(500, "Invalid target '" + targetValue + "' for operator 'threshold_min'"));
    }
    // Check if we have the 'value' attribute in the operator configuration
    if (!configuration || !configuration.value) {
      return f(new PrettyError(500, "Missing configuration attribute 'value' for operator 'threshold_min'"));
    }

    var targetAttributeName = targetValue.substr("data.".length);
    var dataFieldValue = data[targetAttributeName];
    var expectedValue = parseInt(configuration.value, 10);

    // Silently ignore the check if the data attribute we're looking for does not exist
    if (_.isNull(dataFieldValue) || _.isUndefined(dataFieldValue)) {
      return f(null, true);
    }

    return f(null, dataFieldValue > expectedValue);
  };

  return OperatorThresholdMin;
};
