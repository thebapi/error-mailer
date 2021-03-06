'use strict';
var email       = require('emailjs');
var util        = require("util");
var mailEnabled = true;
var emailServer;
var emailTo;
var emailFrom;
var domainName;
var mailSubject;


/**
 * Disable the module.
 */
exports.disable = function () {
  mailEnabled = false;
}

/**
 * Enable the module if it was disabled previously
 */
exports.enable = function (){
  mailEnabled = true
}

/**
 *
 * @param options { user : ,
 *                password: ,
 *                host:,
 *                ssl: ,
 *                port: ,
 *                to: ,
 *                from,
 *                domainName: 'www.openpd.com??' }
 *
 */
exports.configureOptions = function (options) {
  if(!options){
    throw new Error("Invalid configuration options");
    return;
  }

  ['user', 'password', 'host', 'ssl', 'port', 'to', 'from', 'domainName' ].forEach(function(itemName){
    if(typeof options[itemName] === 'undefined'){
      throw new Error("Invalid configuration options. "+itemName + "  is required");
    }
  });

  emailServer = email.server.connect({
    user     : options.user,
    password : options.password,
    host     : options.host,
    ssl      : options.ssl,
    port     : options.port
  });

  emailTo   = options.to;
  emailFrom = options.from;
  domainName = options.domainName;
  if(options.mailSubject) {
    mailSubject = options.mailSubject;
  }else{
    mailSubject = "Error at "+ domainName +"!";
  }

}


function buildErrorMessage(err) {
  var errMsg ="";
  if(err && err.getStack && typeof err.getStack === 'function'){
    errMsg = err.getStack();
  }else if(err && err.message){
    errMsg = err.message;
  }else if(err && err.msg){
    errMsg = err.msg;
  }else {
    errMsg = err;
  }
  var msgArr = [ "Hello,<br/><br/> The system has received an error/exception. And it is sent to you using error mailer.",
    '<br/><br/> The error -> <br/>', errMsg,
    '<br/><br/> Best Regards,<br/> Error Mailer'
  ];
  return msgArr.join(" ");
}

exports.alert = function (err,next) {

  if(mailEnabled === false){
    return;
  }

  var errMsg = buildErrorMessage(err);

  var headers = {
    text    : errMsg ,
    from    : emailFrom,
    to      : emailTo,
    subject : mailSubject
  };

  var message = email.message.create(headers);
  message.attach_alternative(errMsg);
  emailServer.send(message,
    function (err) {
      if (err) {
        next && next(err, null);
      }
      else {
        next && next(null, true);
      }
  });
}
