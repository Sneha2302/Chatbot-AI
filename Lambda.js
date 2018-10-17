exports.handler = (event, context, callback) => {
    // TODO implement
    
    // var data = JSON.parse(event);
    
    if(event.hasOwnProperty("BotRequest")){
        
        
        var data= event.BotRequest.Message.UnstructuredMessage.Text;
        if(data == "hi"){
            callback(null, 'Hey! How can I help you today?');
        }
        else if(data == "season"){
            callback(null, 'Its Spring season right now!');
        }
        else if(data == "area"){
            callback(null, 'We are in New York');
        }
        else if(data == "food"){
            callback(null, 'Pizza in Artichoke is nice!');
        }
        else if(data == "commute"){
            callback(null, 'New York is connected by MTA subway system!');
        }
        else if(data == "bye"){
            callback(null, 'Bye! Have a great day!');
        }
        else{
            callback(null, 'I can respond only to these - hi, season, area, food, commute, bye');
        }
    }
    
    callback(null, event);
};