// Open Bank Project

//var express = require('express', template = require('pug'));
var express = require('express');
var session = require('express-session');
var util = require('util');
var oauth = require('oauth');
var request = require('request');

var app = express();

/////////////////////////////////////
// OAuth Config:
// To make authenticated calls to the API, you need OAuth keys 
// To get them, please register your App here:
// https://YOUR-OBP-API-HOST/consumer-registration
// See README.md for an example config.json

//////////////////////////////////////

// Template engine (previously known as Jade)
var pug = require('pug');

// Used to validate forms
var bodyParser = require('body-parser');

/*
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false });

*/
// This loads your consumer key and secret from a file you create.
var config = require('./config.json');
var _openbankConsumerKey = config.consumerKey;
var _openbankConsumerSecret = config.consumerSecret;
var _openbankRedirectUrl = config.redirectUrl;
var port = config.port;

// The location, on the interweb, of the OBP API server we want to use.
var apiHost = config.apiHost;

//console.log ("Your apiHost is: " + apiHost);
console.log ("This application is running on http:127.0.0.1:" + port);
//console.log ("The redirect URL is: " + _openbankRedirectUrl);


function onException (res, exception, moreData) {
          template = "./template/oops.pug";
          title = "Oops, something went wrong.";
          subTitle = "Maybe you are not logged in?";

          console.log('we got an exception:' + exception);
          var options = { title: title, subTitle: subTitle, exception: exception, moreData: moreData}; 
          var html = pug.renderFile(template, options);
          res.status(500).send(html)
}


var consumer = new oauth.OAuth(
  apiHost + '/oauth/initiate',
  apiHost + '/oauth/token',
  _openbankConsumerKey,
  _openbankConsumerSecret,
  '1.0',                             //rfc oauth 1.0, includes 1.0a
  _openbankRedirectUrl,
  'HMAC-SHA1');

app.get('/getAccounts', function(req, res){

 console.log("I have reached getAccounts");
 var token = req.params.token;
 console.log(token);
 var post_options = {
      uri: 'https://apisandbox.openbankproject.com/obp/v3.1.0/banks/rbs/accounts-held',
      path: '/obp/v3.1.0/banks/rbs/accounts-held',
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization' :'DirectLogin token = ${token}'
      }
   };
   
   request(post_options, function (error, response, body) {
    if (error) {
     console.log("Error" , error);
     return;
    }
    
    var stringifiedData = JSON.stringify(response);
    var parsedData = JSON.parse(stringifiedData);
    console.log(parsedData);
    
   });
});

app.get('/directlogin', function(req, res){
  
   var post_options = {
      uri: 'https://apisandbox.openbankproject.com/my/logins/direct',
      path: '/my/logins/direct',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization' :'DirectLogin username="Deodatta", password="Somalwar@440010", consumer_key = "bvm3huemex4y4lwkjgi3bol33blhhrpq0uotlnyk"'
      }
   };
   
   request(post_options, function (error, response, body) {
    if (error) {
     console.log("Error" , error);
     return;
    }
        
    var stringifiedData = JSON.stringify(response);
    var parsedData = JSON.parse(stringifiedData);
    console.log(parsedData);
    
    var statusCode = parsedData.statusCode;
    console.log(statusCode);
    var token = JSON.parse(parsedData.body).token;
    
    console.log(token);
    //res.status(200).send(token);
    //req.session.accessToken = token;
    var redirect_url = '/getAccounts/?token=' + token;
    console.log(redirect_url);
    res.redirect(redirect_url);
});
   
})

app.listen(port);