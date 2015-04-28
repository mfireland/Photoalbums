module.exports = {
  applicationPort : function() {
    var port = 80;
    if (!process.env.ENVIRONMENT) {
      var local = require('./../config/local');
      port = local.applicationPort;
    }
    return port;
  },
  database : function() {
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
    if (process.env.ENVIRONMENT) {
      var variables = {
        bucket : process.env.S3BUCKET,
	domain : process.env.DOMAIN
      }
      return variables;
    } else {
      var local = require('./../config/local');
      return local.awsVariables;
    }
  },
  absoluteURL : function(path) {
    if (this.awsVariables().domain) {
      return this.awsVariables().domain + '/' + path;
    }
    return path;
  }
}
