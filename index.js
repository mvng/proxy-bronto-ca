// server.js

// BASE SETUP
// =============================================================================
require('dotenv').config();

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var session_id = null;
var parseString = require('xml2js').parseString;

var url = 'https://api.bronto.com/v4?wsdl';
var API = process.env.BRONTO_TOKEN_API;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

var router = express.Router();

var loginEnvelope =
    '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v="http://api.bronto.com/v4">' +
    '<x:Header/>' +
    '<x:Body>' +
    '<v:login>' +
    '<apiToken>' + API + '</apiToken>' +
    '</v:login>' +
    '</x:Body>' +
    '</x:Envelope>';

router.use(function(req, res, next) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open('POST', url, true);

    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    var response = xmlhttp.responseText.substring(xmlhttp.responseText.indexOf("<return"));
                    response = response.substring(response.indexOf(">") + 1);
                    response = response.substring(0, response.indexOf("<"));
                    session_id = response;
                    next(); // make sure we go to the next routes and don't stop here
                }
            }
        }
        // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.send(loginEnvelope);
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Welcome To Our Api!' });
});

router.route('/addContact')

.post(function(req, res) {
    var xmlhttp = new XMLHttpRequest();

    var addToListEnvelope =
    '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v="http://api.bronto.com/v4">' +
    '<x:Header>' +
    '<v:sessionHeader>' +
    '<sessionId>' + session_id + '</sessionId>' +
    '</v:sessionHeader>' +
    '</x:Header>' +
    '<x:Body>' +
    '<v:addContacts>' +
    '<contacts>' +
    '<email>'+ req.body.email + '</email>' +
    '<listIds>' + req.body.list + '</listIds>' +
    '</contacts>' +
    '</v:addContacts>' +
    '</x:Body>' +
    '</x:Envelope>';

    xmlhttp.open('POST', url, true);

    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    // res.json({ response:x2js.xml_str2json(xmlhttp.responseText) });

                    parseString(xmlhttp.responseText, function(err, result) {
                        res.json({'response' : result['soap:Envelope']['soap:Body']});
                    });
                }
            }
        }
        // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.send(addToListEnvelope);


});

app.use('/api', router);

app.listen(port);
console.log('Listening on Port ' + port);
