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
      schema: {
        monitoring: {
          create: 'application/vnd.com.statwarn.monitoring.create.v1+json'
        }
      },

      alerting: {
        api: {
          endpoint: 'http://127.0.0.1:9000/'
        },

        trigger: {},
        action: {}
      },

      monitoring: {
        api: {
          port: 9002,
          endpoint: 'http://127.0.0.1:9002'
        }
      }
    }
  });

  // export env
  config.env = env;

  return config;
};
