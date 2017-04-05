'use strict';
var Alexa = require('alexa-sdk');
var APP_ID = undefined;


var SKILL_NAME = 'number facts';

var myTriviaRequest = 'trivia';
var myMathRequest = 'math';
var myYearRequest = 'year';
var myDateRequest = 'date';
var myRandomRequestArr = [myDateRequest,myMathRequest,myTriviaRequest,myYearRequest];
var myRandomRequest = myRandomRequestArr[Math.floor(Math.random()*myRandomRequestArr.length)];




exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewRandomFactIntent');
    },

    'GetNewRandomFactIntent': function () {

        httpGet(myRandomRequest,  myResult => {
                console.log("sent     : " + myRandomRequest);
                console.log("received : " + myResult);

                this.emit(':tell', myResult );

            }
        );

    },
        'GetNewTriviaFactIntent': function () {

        httpGet(myTriviaRequest,  myResult => {
                console.log("sent     : " + myTriviaRequest);
                console.log("received : " + myResult);

                this.emit(':tell', myResult );

            }
        );

    },
        'GetNewYearFactIntent': function () {

        httpGet(myYearRequest,  myResult => {
                console.log("sent     : " + myYearRequest);
                console.log("received : " + myResult);

                this.emit(':tell', myResult );

            }
        );

    },
    'GetNewDateFactIntent': function () {

        httpGet(myDateRequest,  myResult => {
                console.log("sent     : " + myDateRequest);
                console.log("received : " + myResult);

                this.emit(':tell', myResult );

            }
        );

    },
    'GetNewMathFactIntent': function () {

        httpGet(myMathRequest,  myResult => {
                console.log("sent     : " + myMathRequest);
                console.log("received : " + myResult);

                this.emit(':tell', myResult );

            }
        );

    },
'AMAZON.HelpIntent': function () {
        var speechOutput = "You can say tell me a number fact, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }
};



var http = require('http');

function httpGet(myData, callback) {



      var options = {
            host: 'numbersapi.com',
            port: 80,
            path: '/random/' + encodeURIComponent(myData) +'?json',
            method: 'GET'
        };

    var req = http.get(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            console.log(JSON.stringify(returnData));

        var pop = JSON.parse(returnData).text;

            callback(pop);  

        });

    });
    req.end();

}
