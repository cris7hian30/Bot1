"use strict"

const express = require ("express");
const bodyParser = require ("body-parser");
const request = require ("request");

const access_token = "EAAEqdEYgOZC8BAJD4p0Sv5wRtXJlVzm9nU1V5UZAactDs6SRe1iMNMHDRZC99QZAS0a9HIZBCjcPCpk8VtoVEzAMtQ1go7os8tnZCWogVQYe1T4anH1bIwZAah3E9OgrHFyL53g5XH4WPBc7GRF4IuzVHyNDb5vcJ6HYTs7vta96AZDZD"

const app = express();

app.set("port", 5000);
app.use(bodyParser.json());

app.get("/", function (req , response){
    response.send("Hola Programador");
});

app.get("/webhook", function(req, response){
    if(req.query["hub.verify_token"] === "bar_token"){
        response.send(req.query["hub.challenge"]);
    }else{
        response.send("Alto ahí, no tienes permisos");
    }
});

app.post("/webhook/", function(req, res){
    const webhook_event = req.body.entry[0];
    if (webhook_event.messaging) {
         webhook_event.messaging.forEach(event => {
           //console.log(event);
           handleEvent(event.sender.id, event);
        });
    }
    res.sendStatus(200);
});

function handleEvent (senderId, event) {
    if(event.message){
        handleMessage(senderId, event.message)
    } else if (event.postback){
        handlePostback (senderId, event.postback.payload)
    }
}

function handleMessage (senderId, event){
    if (event.text){
        defaultMessage(senderId);
    }else if (event.attachments){
        handleAttachments(senderId, event)
    }
}

//Mensaje por defecto
function defaultMessage (senderId){
    const messageData = {
        "recipient": {
            "id":senderId
        },
//opciones por defecto "respuestas rapidas"
        "message":{
            "text": "Hola bienvenido a la pagina de nuestro bar, aqui encontraras todas las ofertas de nuestro menu.",
            "quick_replies":[
                {
                    "content_type": "text",
                    "title":"¿Quieres ordenar? 👇",
                    "payload":"ORDEN_PAYLOAD"
                },
                {
                    "content_type": "text",
                    "title":"Llamar 📲",
                    "payload":"PN_PAYLOAD" 
                }
            ]
        }
    }
    senderActions(senderId);
    callSendApi(messageData);
}

//Funcion Reservas
function pnMessage (senderId){
    var messageData= {
        "recipient":{
            "id": senderId
        },
        "message":{
            "text" : "Llamanos a este numero para poder hacer tu reserva de mesa +52 411 102 82 49"
                    }
}
    senderActions(senderId);
    callSendApi(messageData);
}

//Deteccion de postback
function handlePostback (senderId, payload){
    console.log(payload)
    switch (payload){
        case "GET_STARTED_FG":
          defaultMessage(senderId);
        break;
        case "CERVEZAS_PAYLOAD":
          showCerveza(senderId);
        break;
        case "RESERVAS_PAYLOAD":
            pnMessage(senderId);
        break;
    }
}

//Manejador de sucesos - archivos
function handleAttachments(senderId, event){
    let attachment_type = event.attachments[0].type;
    switch (attachment_type){
            case "image":
                console.log(attachment_type);
            break;
            case "video":
                console.log(attachment_type);
            break;
            case "document":
                console.log(attachment_type);
            break;
            case "audio":
                console.log(attachment_type);
            break;
    }
}

//Envio de Acciones (Visto "mark_seen", Escribiendo "typing_on", Ignorado "typing_off")
function senderActions(senderId){
    const messageData={
        "recipient":{
            "id":senderId
        },
        "sender_action":"typing_on"
    }
    callSendApi(messageData);
}

//Funcion Enviar Mensaje
function callSendApi(response){
    request({
        "uri": "https://graph.facebook.com/me/messages",
        "qs": {
             "access_token": access_token
        },
        "method": "POST",
        "json": response
    },

//Funcion de error
    function (err){
    if (err){
        console.log("Ha ocurrido un error :c")
    }else{
        console.log("Mensaje enviado xD")
    }
  }
 )
}
//Agregar plantillas de Productos
function showCerveza(senderId){
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "elements": [
                        //Inicio de Tarjeta
                        {
                            "title": "Dos Equis",
                            "Subtitle": "Clasica y Ambar",
                            "image_url": "https://i.imgur.com/6S1jjjW.png",
                            //Boton que manda payload de la orden
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir",
                                    "payload": "C2E_PAYLOAD",
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };
    senderActions(senderId);
    callSendApi(messageData);
}

app.listen(app.get("port"),function(){
    console.log("El puerto funcionando es el",app.get("port"));
});