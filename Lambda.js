exports.handler = (event, context, callback) => {

    if(event.hasOwnProperty("BotRequest")){

        var data= event.BotRequest.Message.UnstructuredMessage.Text;
        if(data == "hi"){
            callback(null, 'Hey! How can I help you today?');
        }
        else if(data == "football"){
            callback(null, 'Liverpool is the best!');
        }
        else if(data == "tv"){
            callback(null, 'I dont like tv ');
        }
        else if(data == "temperature"){
            callback(null, 'It is currently 70 degress Farenheit, so cold?');
        }
        else if(data == "food"){
            callback(null, 'I love Korean food!');
        }
        else if(data == "BTS" || data == "bts"){
            callback(null, 'Best K-POP band ever!');
        }
        else if(data == "bye"){
            callback(null, 'I\'m sad that you\'re going but ok, bye!');
        }
        else{
            callback(null, 'I can respond only to these - hi, football, tv, temperature, food, BTS, bye');
        }
    }

    callback(null, event);
};