var globals = require('./globals');
var debug = require('debug')('photoalbums:lib:cwlogs');
var aws= require('aws-sdk');

var cloudwatchlogs = new aws.CloudWatchLogs({region: globals.awsVariables().region});

var logParams = {
  logGroupName : 'Photoalbums',
  logStreamName : 'application',
  logEvents : []
};

// store event in logs to be sent to CloudWatch Logs
function logEvent(message) {
  var eventTimestamp = Math.floor(new Date());
  var newEvent = {
    message: message,
    timestamp: eventTimestamp
  }
  logParams.logEvents.push(newEvent);
}

function putLogs() {
  if (logParams.logEvents.length > 0) {
    getSequenceToken(function(err, token) {
      if (token) {
        logParams.sequenceToken = token;
      }
      cloudwatchlogs.putLogEvents(logParams, function(err, data) {
        if (err) {
        } else {
          logParams.sequenceToken = data.nextSequenceToken;
          logParams.logEvents = [];
        }
      });
    });
  }
}

function getSequenceToken(callback) {
  cloudwatchlogs.describeLogStreams({logGroupName:logParams.logGroupName}, function(err, data) {
    if (err) {
      callback(err);
    } else {
      for (var i = 0; i < data.logStreams.length; i++) {
        var logStream = data.logStreams[i];
        if (logStream.logStreamName == logParams.logStreamName) {
          callback(null, logStream.uploadSequenceToken);
          break;
        }
      }
    }
  });
}


exports.logEvent = logEvent;
exports.putLogs = putLogs;
