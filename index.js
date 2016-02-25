require('dotenv').config();

const CONTACT_EXIST_CODE = '305';

var express = require('express');
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var parseString = require('xml2js').parseString;

var app = express(); 

var url = 'https://api.bronto.com/v4?wsdl';
var API = process.env.BRONTO_TOKEN_API;

var session_id = null;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.use(function(req, res, next) {
    var xmlhttp = new XMLHttpRequest();

    var loginEnvelope =
        '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v="http://api.bronto.com/v4">' +
        '<x:Header/>' +
        '<x:Body>' +
        '<v:login>' +
        '<apiToken>' + API + '</apiToken>' +
        '</v:login>' +
        '</x:Body>' +
        '</x:Envelope>';

    xmlhttp.open('POST', url, true);

    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {

                    var response = xmlhttp.responseText.substring(xmlhttp.responseText.indexOf("<return"));
                    response = response.substring(response.indexOf(">") + 1);
                    response = response.substring(0, response.indexOf("<"));

                    session_id = response;
                    next();
                }
            }
        }
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.send(loginEnvelope);
});

router.route('/addContact')

.post(function(req, res) {
    var xmlhttp = new XMLHttpRequest();

    var addContactToList =
        '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v="http://api.bronto.com/v4">' +
        '<x:Header>' +
        '<v:sessionHeader>' +
        '<sessionId>' + session_id + '</sessionId>' +
        '</v:sessionHeader>' +
        '</x:Header>' +
        '<x:Body>' +
        '<v:addContacts>' +
        '<contacts>' +
        '<email>' + req.body.email + '</email>' +
        '<listIds>' + req.body.list + '</listIds>' +
        '</contacts>' +
        '</v:addContacts>' +
        '</x:Body>' +
        '</x:Envelope>';

    xmlhttp.open('POST', url, true);

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {

                parseString(xmlhttp.responseText, function(err, result) {

                    if (result['soap:Envelope']['soap:Body'][0]['ns2:addContactsResponse'][0]['return'][0]['results'][0]['errorCode'] == CONTACT_EXIST_CODE) {

                        var contactExistToList = '<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v="http://api.bronto.com/v4">' +
                            '<x:Header>' +
                            '<v:sessionHeader>' +
                            '<sessionId>' + session_id + '</sessionId>' +
                            '</v:sessionHeader>' +
                            '</x:Header>' +
                            '<x:Body>' +
                            '<v:addToList>' +
                            '<list>' +
                            '<id>' + req.body.list + '</id>' +
                            '</list>' +
                            '<contacts>' +
                            '<email>' + req.body.email + '</email>' +
                            '</contacts>' +
                            '</v:addToList>' +
                            '</x:Body>' +
                            '</x:Envelope>';

                        var contactExistRequest = new XMLHttpRequest();
                        contactExistRequest.open('POST', url, true);

                        contactExistRequest.onreadystatechange = function() {

                            if (contactExistRequest.readyState == 4) {
                                if (contactExistRequest.status == 200) {
                                    res.json({ response: contactExistRequest.responseText });
                                }
                            }
                        }

                        contactExistRequest.setRequestHeader('Content-Type', 'text/xml');
                        contactExistRequest.send(contactExistToList);
                    } else {
                        res.json({ 'response': result['soap:Envelope']['soap:Body'] });
                    }
                });
            }
        }
    }
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.send(addContactToList);

});

app.use('/api', router);

app.listen(port);
console.log('Listening on Port ' + port);
