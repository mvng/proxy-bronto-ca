// server.js

// BASE SETUP
// =============================================================================
require('dotenv').config();

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var session_id = null;

  var soap = require('soap');
  var url = 'https://api.bronto.com/v4?wsdl';
  var args = {apiToken: '6CE0FBD3-396C-4A8E-B0D4-0F4214C46F79'};
  var API = process.env.BRONTO_TOKEN_API;






// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();    

router.use(function(req, res, next) {
 var xmlhttp = new XMLHttpRequest();
       xmlhttp.open('POST', url, true);

       // build SOAP request
       var sr =
      '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v="http://api.bronto.com/v4">' +
          '<x:Header/>' +
          '<x:Body>' +
              '<v:login>' +
                  '<apiToken>'+API+'</apiToken>' +
              '</v:login>' +
          '</x:Body>' +
      '</x:Envelope>';

       xmlhttp.onreadystatechange = function () {
           if (xmlhttp.readyState == 4) {
               if (xmlhttp.status == 200) {
                var response = xmlhttp.responseText.substring(xmlhttp.responseText.indexOf("<return"));
                response = response.substring(response.indexOf(">")+1);
                response = response.substring(0,response.indexOf("<"));
                session_id = response;
                next(); // make sure we go to the next routes and don't stop here
               }
           }
       }
       // Send the POST request
       xmlhttp.setRequestHeader('Content-Type', 'text/xml');
       xmlhttp.send(sr);    
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/addContact')

    .post(function(req, res) {
            res.json({ session_id: session_id });    
    });
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);