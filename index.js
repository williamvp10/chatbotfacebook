'use strict';
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

// weatherman fb page
const token = "EAAghpqdArs0BABZBBuirkF5PS171dxcVVLj5sn8V0id2hVikA9HoP11YacqKjb83mtXCx4o11bGjLsopIlvJxZAWtjKvzCGCTZBdSFyAD1eT485xjJZCSVEFNyjUZA29Rvi5KELOzl4CggZCs9SvExfWL4UOzdZAiaZCaoFPUy27HQZDZD";
const msngerServerUrl = 'https://chatbotwilliam.herokuapp.com/bot';
app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

app.use(express.static('public'))

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am Weatherman!.')
})

app.post('/webhook/', function (req, res) {
    console.log(JSON.stringify(req.body));
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {

        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        let recipient = event.recipient.id;
        let time = req.body.entry[0].time;
        let text = "";
        try {
            text = req.body.entry[0].messaging[i].postback.title;
            let type = req.body.entry[0].messaging[i].postback.payload;
            console.log(type);
            request({
                url: msngerServerUrl,
                method: 'POST',
                form: {
                    'userType': type,
                    'userUtterance': text
                }
            }, function (error, response, body) {
                //response is from the bot
                if (!error && response.statusCode === 200) {
                    selectTypeBotMessage(sender, body);
                } else {
                    sendTextMessage(sender, 'Error!');
                }
            });

        } catch (err) {
            sendtextbot(event, sender);
        }

    }

    res.sendStatus(200);
});

function sendtextbot(event, sender) {
    if (event.message && event.message.text) {
        let text = event.message.text;
        //send it to the bot
        request({
            url: msngerServerUrl,
            method: 'POST',
            form: {
                'userUtterance': text
            }
        },
                function (error, response, body) {
                    //response is from the bot
                    if (!error && response.statusCode === 200) {
                        selectTypeBotMessage(sender, body);
                    } else {
                        sendTextMessage(sender, 'Error!');
                    }
                });
    }
}
function selectTypeBotMessage(sender, body) {
    // Print out the response body
    console.log(body);
    body = body.substring(1, body.length - 1);
    body = body.replace(/\\/g, '');
    let botOut = JSON.parse(body);
    if (botOut.botUtterance !== null) {
        if (botOut.type !== null) {
            var ty = botOut.type;
            var t1 = "saludo";
            var n1 = ty.localeCompare(t1);
            var t2 = "bye";
            var n2 = ty.localeCompare(t2);
            if (n1 === 0) {
                sendTextMessageType(sender, botOut);
            } else if (n2 === 0) {
                sendTextMessageType(sender, botOut);
            } else {
                sendTextMessage(sender, "disculpa no puedo responder a tu solicitud");
            }


        }
        console.log(botOut.botUtterance);
    }
}
function sendTextMessageType(sender, bot) {
    let buttons = '[ ';
    for (var i = 0; i < bot.buttons.length; i++) {
        if (i !== 0) {
            buttons += ',';
        }
        buttons += '{';
        buttons += '"type": "postback",';
        buttons += '"title": "' + bot.buttons[i].titulo + '",';
        buttons += ' "payload": "' + bot.buttons[i].respuesta + '"';
        buttons += '}';
    }
    buttons += ']';
    console.log(buttons);
    let b = JSON.parse(buttons);
    if (bot !== 'null') {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": bot.botUtterance,
                    "buttons": b
                }
            }
        };
        console.log(messageData);
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}


function sendTextMessage(sender, text) {
    if (text !== 'null') {

        let messageData = {'text': text
        };
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }
}

