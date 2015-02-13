'use strict';

module.exports = function (logger) {
  var env = require('common-env')(logger);

  var config = env.getOrElseAll({
    amqp: {
      login: 'guest',
      password: 'guest',
      host: 'localhost',
      port: 5672,
      vhost: '',

      alerting: {
        trigger: {
          queue: 'monitoring.new'
        }
      },
    },

    statwarn: {
      alerting: {
        api: {
          endpoint: 'http://127.0.0.1:9000/'
        },

        trigger: {},
        action: {}
      },
    }
  });

  // export env
  config.env = env;

  return config;
};
