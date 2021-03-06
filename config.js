'use strict';

module.exports = function (logger) {
  var env = require('common-env')(logger);

  var config = env.getOrElseAll({
    amqp: {
      user: 'guest',
      pass: 'guest',
      server: 'localhost',
      port: 5672,
      vhost: '%2fstatwarn',
      replyQueue: 'reply_queue',

      alerting: {
        trigger: {
          queue: 'monitoring.create',
          exchange: {
            name: 'statwarn',
            type: 'topic'
          },
          routing_key: {
            prefix: 'alerts.triggered.'
          }
        }
      }
    },

    statwarn: {
      schema: {
        monitoring: {
          create: 'application/vnd.com.statwarn.monitoring.create.v1+json'
        },
        alerts: {
          triggered: 'application/vnd.com.statwarn.alerts.triggered.v1+json'
        }
      },

      alerting: {
        api: {
          endpoint: 'http://127.0.0.1:9000'
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
