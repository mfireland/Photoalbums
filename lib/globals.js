var debug = require('debug')('photoalbums:lib:globals');

module.exports = {
  environment : function() {
    debug('environment');
    if (process.env.ENVIRONMENT) {
      return process.env.ENVIRONMENT;
    } else {
      return 'development';
    }
  },
  applicationPort : function() {
    debug('applicationPort');
    var port = 80;
    if (!process.env.ENVIRONMENT) {
      var local = require('./../config/local');
      port = local.applicationPort;
    }
    return port;
  },
  database : function() {
    debug('database');
    if (process.env.ENVIRONMENT) {
      var opsworks = require('./../opsworks');
      var opsWorksDB = opsworks.db;
      var rdsConnection = {
        host : opsWorksDB.host,
        port : opsWorksDB.port,
        database : opsWorksDB.database,
        user : opsWorksDB.username,
        password : opsWorksDB.password
      };
      return rdsConnection;
    } else {
      var local = require('./../config/local');
      var localConnection = local.db;
      return localConnection;
    }
  },
  awsVariables : function() {
    debug('awsVariables');
    if (process.env.ENVIRONMENT) {
      var variables = {
        bucket : process.env.S3BUCKET,
	domain : process.env.DOMAIN,
	region : process.env.REGION
      }
      return variables;
    } else {
      var local = require('./../config/local');
      return local.awsVariables;
    }
  },
  absoluteURL : function(path) {
    debug('absoluteURL: path=',path);
    if (this.awsVariables().domain) {
      return this.awsVariables().domain + '/' + path;
    }
    return path;
  },
  rootDomain : function() {
    debug('rootDomain');
    return this.awsVariables().domain.replace('http://www.','');
  }
}
