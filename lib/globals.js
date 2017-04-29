var debug = require('debug')('photoalbums:lib:globals');

module.exports = {
  environment() {
    debug('environment');
    if (process.env.ENVIRONMENT) {
      return process.env.ENVIRONMENT;
    } else {
      return 'development';
    }
  },
  applicationPort() {
    debug('applicationPort');
    var port = 80;
    if (!process.env.ENVIRONMENT) {
      var local = require('./../config/local');
      port = local.applicationPort;
    }
    return port;
  },
  database() {
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
  awsVariables() {
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
  absoluteURL(path) {
    debug('absoluteURL: path=',path);
    if (this.awsVariables().domain) {
      return this.awsVariables().domain + '/' + path;
    }
    return path;
  },
  rootDomain() {
    debug('rootDomain');
    return this.awsVariables().domain.replace('http://www.','');
  }
}
