'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
// bot fb page
const token = "EAAghpqdArs0BABYz6RzM7dEV16ZC6HjNybYQAkKUrbiShFKpXx8wQtc1qhKpDVJcZCeg8f8odRZCdpwQHu0jH0e1DykSnAwrj4SPOj4rsBWymTQabXBq7Uv1AgMSYr8iJ9iurogN2WCgJVyxTEkXVoqCsghQuVKXhZAYoipIIAZDZD";
const msngerServerUrl = 'https://chatbotwilliam.herokuapp.com/bot';
//global var
var EstadoActuador = false;
var users
app.set('port', (process.env.PORT || 5000));
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// Process application/json
app.use(bodyParser.json());
app.use(express.static('public'));
// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am Weatherman!.');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'iam-weatherman-bot') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});
// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'));
});
app.post('/webhook/', function (req, res) {
    console.log(JSON.stringify(req.body));

    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        InfoPersona(sender);
        let recipient = event.recipient.id;
        let time = req.body.entry[0].time;
        let text = "";
        if (EstadoActuador) {
            EstadoActuador = false;
            text = event.message.text;
            type = "requestModificarActuador";
            console.log(type);
            request({
                url: msngerServerUrl,
                method: 'POST',
                form: {
                    'userInfo': user,
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
        } else {
            try {
                text = req.body.entry[0].messaging[i].postback.title;
                var type = "" + req.body.entry[0].messaging[i].postback.payload;
                console.log(type);
                request({
                    url: msngerServerUrl,
                    method: 'POST',
                    form: {
                        'userInfo': user,
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
    }

    res.sendStatus(200);
});

function InfoPersona(sender) {
    request({
        url: 'https://graph.facebook.com/' + sender + '?fields=first_name,last_name,profile_pic&access_token=' + token,
        method: 'GET',
    }, function (error, response, body) {
        console.log(response);
        let u = '{';
        u += '"first_name": "'+response.first_name+'",';
        u += '"last_name": "' + response.last_name + '",';
        u += ' "profile_pic": "' + response.profile_pic+ '",';
         u += '"id": "' + response.id + '"';
        u += '}';
        user = JSON.parse(u);
        console.log(user);
    });

}

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
            var t1 = "Saludo";
            var n1 = ty.localeCompare(t1);
            var t2 = "MenuOpciones";
            var n2 = ty.localeCompare(t2);
            var t3 = "AllSensors";
            var n3 = ty.localeCompare(t3);
            var t4 = "IdSensor";
            var n4 = ty.localeCompare(t4);
            var t5 = "InfoSensor";
            var n5 = ty.localeCompare(t5);
            var t6 = "EstadoActuador";
            var n6 = ty.localeCompare(t6);
            var t7 = "ModificarActuador";
            var n7 = ty.localeCompare(t7);
            var t8 = "agradecimiento";
            var n8 = ty.localeCompare(t8);
            var t9 = "ModificarSensor";
            var n9 = ty.localeCompare(t9);
            var t10 = "IdSensor2";
            var n10 = ty.localeCompare(t10);
            var t11 = "PreguntaEstadoActuador";
            var n11 = ty.localeCompare(t11);
            if (n1 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n2 === 0) {
                sendTextMessageList(sender, botOut);

            } else if (n3 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n4 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n5 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n6 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n7 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n8 === 0) {
                sendTextMessage(sender, botOut.botUtterance);
            } else if (n9 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n10 === 0) {
                sendTextMessageList(sender, botOut)
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
            } else if (n11 === 0) {
                EstadoActuador = true;
                sendTextMessage(sender, botOut.botUtterance);

            } else {
                if (botOut.buttons.length === 0) {
                    sendTextMessage(sender, botOut.botUtterance);
                } else {
                    sendTextMessageType(sender, botOut);
                }
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


function sendTextMessageList(sender, bot) {
    console.log(bot);
    let elements = '[';
    let cant = 0;
    if (bot.elements.length > 10) {
        cant = 10;
    } else {
        cant = bot.elements.length;
    }
    for (var i = 0; i < cant; i++) {
        if (i !== 0) {
            elements += ',';
        }
        elements += '{';
        elements += '"title":"' + bot.elements[i].titulo + '"';
        var subtitulo = "";
        try {
            var t1 = "undefined";
            var n1 = bot.elements[i].subtitulo.localeCompare(t1);
            if (n1 !== 0) {
                var subtitulo = bot.elements[i].subtitulo;
                elements += ',"subtitle":"' + subtitulo + '"';
            }

        } catch (err) {
        }
        try {
            var t1 = "undefined";
            var n1 = bot.elements[i].url.localeCompare(t1);
            if (n1 !== 0) {
                var url = bot.elements[i].url;
                elements += ',"image_url":"' + url + '"';
            }
        } catch (err) {
        }
        if (bot.elements[i].buttons.length > 0) {
            elements += ',"buttons":[';
            for (var j = 0; j < bot.elements[i].buttons.length; j++) {
                elements += '{';
                elements += ' "type": "postback",';
                elements += ' "title": "' + bot.elements[i].buttons[j].titulo + '",';
                elements += ' "payload": "' + bot.elements[i].buttons[j].respuesta + '"';
                elements += '}';
            }
            elements += ']';
        }
        elements += '}';
    }
    elements += ']';

    let arrayElements = JSON.parse(elements);
    console.log(arrayElements);
    if (bot !== 'null') {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": arrayElements
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

function sendListText(sender, bot) {
    console.log(bot);
    for (var i = 0; i < bot.elements.length; i++) {
        sendTextMessage(sender, bot.elements[i].titulo);
    }

}