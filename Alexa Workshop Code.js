/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');

const APP_ID='';

//Defining the Strings used later on
var languageStrings = {
    'en': {
        'translation': {
            'WELCOME' : "Welcome to London Guide!",
            'HELP'    : "Say about, to hear more about the city, or say coffee, breakfast, lunch, or dinner, to hear local restaurant suggestions, or say recommend an attraction, or say, go outside. ",
            'ABOUT'   : "London is the capital city of the UK.  A popular tourist destination, London has a rich history of architecture and finance.",
            'STOP'    : "Okay, see you next time!"
        }
    }
};

//Data we will use later
var data = {
    "city"        : "London",
    "state"       : "UK",
    "postcode"    : "01930",
    "restaurants" : [
        { "name":"Zeke's Place",
            "address":"66 East Main Street", "phone": "978-283-0474",
            "meals": "breakfast, lunch",
            "description": "A cozy and popular spot for breakfast.  Try the blueberry french toast!"
        },
        { "name":"Morning Glory Coffee Shop",
            "address":"25 Western Avenue", "phone": "978-281-1851",
            "meals": "coffee, breakfast, lunch",
            "description": "A homestyle diner located just across the street from the harbor sea wall."
        },
        { "name":"Sugar Magnolias",
            "address":"112 Main Street", "phone": "978-281-5310",
            "meals": "breakfast, lunch",
            "description": "A quaint eatery, popular for weekend brunch.  Try the carrot cake pancakes."
        },
        { "name":"Seaport Grille",
            "address":"6 Rowe Square", "phone": "978-282-9799",
            "meals": "lunch, dinner",
            "description": "Serving seafood, steak and casual fare.  Enjoy harbor views on the deck."
        },
        { "name":"Latitude 43",
            "address":"25 Rogers Street", "phone": "978-281-0223",
            "meals": "lunch, dinner",
            "description": "Features artsy decor and sushi specials.  Live music evenings at the adjoining Minglewood Tavern."
        },
        { "name":"George's Coffee Shop",
            "address":"178 Washington Street", "phone": "978-281-1910",
            "meals": "coffee, breakfast, lunch",
            "description": "A highly rated local diner with generously sized plates."
        },

    ],
    "attractions":[
        {
            "name": "Whale Watching",
            "description": "Gloucester has tour boats that depart twice daily from Rogers street at the harbor.  Try either the 7 Seas Whale Watch, or Captain Bill and Sons Whale Watch. ",
            "distance": "0"
        },
        {
            "name": "Good Harbor Beach",
            "description": "Facing the Atlantic Ocean, Good Harbor Beach has huge expanses of soft white sand that attracts hundreds of visitors every day during the summer.",
            "distance": "2"
        },
        {
            "name": "Rockport",
            "description": "A quaint New England town, Rockport is famous for rocky beaches, seaside parks, lobster fishing boats, and several art studios.",
            "distance": "4"
        },
        {
            "name": "Fenway Park",
            "description": "Home of the Boston Red Sox, Fenway park hosts baseball games From April until October, and is open for tours. ",
            "distance": "38"
        }
    ]
}

// Weather courtesy of the Yahoo Weather API.
// This free API recommends no more than 2000 calls per day
// Defining the API for weather (Comes In Later)
var myAPI = {
    host: 'query.yahooapis.com',
    port: 443,
    path: `/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${encodeURIComponent(data.city)}%2C%20${data.state}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`,
    method: 'GET'
};


// 2. Skill Code =======================================================================================================


//Defining exports for Lambda function
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
	//When users launch the skill
    'LaunchRequest': function () {
    	//variable say = welcome string and help string
        var say = this.t('WELCOME') + ' ' + this.t('HELP');
        //Alexa result: Ask say variable. If not responded to use say again
        this.emit(':ask', say, say);
    },
    	//when About intent is triggered
    'AboutIntent': function () {
    	//Alexa result: tell about string
        this.emit(':tell', this.t('ABOUT'));
    },
    	//when coffee intent is triggered
    'CoffeeIntent': function () {
    	//calling helper functions and getting the name of place
        var restaurant = randomArrayElement(getRestaurantsByMeal('coffee'));
        this.attributes['restaurant'] = restaurant.name;
        	//asking if you want to hear more details
        var say = 'For a great coffee shop, I recommend, ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },
    //same as coffee except for breakfast/dinner/lunch
    'BreakfastIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('breakfast'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'For breakfast, try this, ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },

    'LunchIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('lunch'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'Lunch time! Here is a good spot. ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },

    'DinnerIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('dinner'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'Enjoy dinner at, ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },
    	//if users says yes to the Would you like to hear more question
    'AMAZON.YesIntent': function () {
    	//gets the restaurant details using helper function
        var restaurantName = this.attributes['restaurant'];
        var restaurantDetails = getRestaurantByName(restaurantName);
        	//say variable : name is located at address and the phone number is phone and the descripton is description .........
        var say = restaurantDetails.name
            + ' is located at ' + restaurantDetails.address
            + ', the phone number is ' + restaurantDetails.phone
            + ', and the description is, ' + restaurantDetails.description
            + '  I have sent these details to the Alexa App on your phone.  Enjoy your meal! <say-as interpret-as="interjection">bon appetit</say-as>' ;
            																					//This is an SSML tag
            																					//Speech Synthesis Markup Language
            																					//Like this <say-as interpret-as="spell-out">hello</say-as>
            																					//interjection means Alexa says it in a more "expressive" voice
        var card = restaurantDetails.name + '\n' + restaurantDetails.address + '\n'
            + data.city + ', ' + data.state + ' ' + data.postcode
            + '\nphone: ' + restaurantDetails.phone + '\n';
            //You can also send cards to the Alexa app. This is adding those details on a card

            	//saying the say variable, then setting the card title, then setting the inner card
        this.emit(':tellWithCard', say, restaurantDetails.name, card);

    },

    'AttractionIntent': function () {
    	//setting default search radius
        var distance = 200;
        //if the user said it with the slot then set the distance to the slot value
        if (this.event.request.intent.slots.distance.value) {
            distance = this.event.request.intent.slots.distance.value;
        }
        	//use helper function to get an attraction
        var attraction = randomArrayElement(getAttractionsByDistance(distance));
        	//say variable
        var say = 'Try '
            + attraction.name + ', which is '
            + (attraction.distance == "0" ? 'right downtown. ' : attraction.distance + ' miles away. Have fun! ')
            + attraction.description;

        this.emit(':tell', say);
    },

    'GoOutIntent': function () {

        getWeather( ( localTime, currentTemp, currentCondition) => {
            // time format 10:34 PM
            // currentTemp 72
            // currentCondition, e.g.  Sunny, Breezy, Thunderstorms, Showers, Rain, Partly Cloudy, Mostly Cloudy, Mostly Sunny

            // sample API URL for Irvine, CA
            // https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22irvine%2C%20ca%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys

            this.emit(':tell', 'It is ' + localTime
                + ' and the weather in ' + data.city
                + ' is '
                + currentTemp + ' and ' + currentCondition);

        });
    },
    	//if a user says no, then trigger the stop intent
    'AMAZON.NoIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    //if a users says help then say the help message
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP'));
    },
    //if a user cancels or stops then say the stop message
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP'));
    }

};


// 3. Helper Functions  =================================================================================================
//not going to go into these because they are just plain javascript functions. Do if have extra time

function getRestaurantsByMeal(mealtype) {

    var list = [];
    for (var i = 0; i < data.restaurants.length; i++) {

        if(data.restaurants[i].meals.search(mealtype) >  -1) {
            list.push(data.restaurants[i]);
        }
    }
    return list;
}

function getRestaurantByName(restaurantName) {

    var restaurant = {};
    for (var i = 0; i < data.restaurants.length; i++) {

        if(data.restaurants[i].name == restaurantName) {
            restaurant = data.restaurants[i];
        }
    }
    return restaurant;
}

function getAttractionsByDistance(maxDistance) {

    var list = [];

    for (var i = 0; i < data.attractions.length; i++) {

        if(parseInt(data.attractions[i].distance) <= maxDistance) {
            list.push(data.attractions[i]);
        }
    }
    return list;
}

function getWeather(callback) {
    


    var req = https.request(myAPI, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
            var channelObj = JSON.parse(returnData).query.results.channel;

            var localTime = channelObj.lastBuildDate.toString();
            localTime = localTime.substring(17, 25).trim();

            var currentTemp = channelObj.item.condition.temp;

            var currentCondition = channelObj.item.condition.text;

            callback(localTime, currentTemp, currentCondition);

        });

    });
    req.end();
}
function randomArrayElement(array) {
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
