var aws = require('aws-sdk');
var globals = require('./globals');
var debug = require('debug')('photoalbums:lib:mail');

function sendEmail(params, callback) {
  debug('sendEmail: To="%s"', params.username);
  if (globals.awsVariables().key) {
    aws.config.update({ accessKeyId: globals.awsVariables().key, secretAccessKey:
    globals.awsVariables().secret });
  }
  var ses = new aws.SES({region:'us-east-1'});
  var recipient = params.username + '<' + unescape(params.email) + '>';
  var sesParams = {
    Source: params.messageSource,
    Destination: {
      ToAddresses: [recipient],
      BccAddresses: params.bccAddress
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: 'UTF-8'
      },
      Body: {
        Text: {
          Data: params.messageText,
          Charset: 'UTF-8'
        },
        Html: {
          Data: params.messageHTML,
          Charset: 'UTF-8'
        }
      }
    },
    ReplyToAddresses: [emailSender()]
  }
  ses.sendEmail(sesParams, function(err, data) {
    callback(err, data);
  });
}

function sendRegistrationConfirmation(params, callback) {
  debug('sendRegistrationConfirmation: To="%s"', params.username);
  var emailParams = {
    username : params.username,
    email : params.email
  };
  emailParams.messageSource = emailSender();
  emailParams.bccAddress = [];
  emailParams.subject = 'Registration Confirmation';
  emailParams.messageText = 'You have successfully registered for Photoalbums. '
                          + 'Your username is ' + emailParams.username + '.';
  emailParams.messageHTML = 'You have successfully registered for Photoalbums. '
                          + 'Your username is <strong>' + emailParams.username + '</strong>.';
  sendEmail(emailParams, callback);
}

function emailSender() {
  debug('emailSender: "donotreply"');
  return 'donotreply@' + globals.rootDomain();
}


exports.sendRegistrationConfirmation = sendRegistrationConfirmation;
