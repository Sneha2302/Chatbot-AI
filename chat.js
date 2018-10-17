(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, message_side, sendMessage, load;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = message_side === 'left' ? 'right' : 'left';
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 700);
        };

        load = function (text) {
            sendMessage(text);

            var apigClient = apigClientFactory.newClient({
                invokeUrl: config.invokeUrl, // REQUIRED
                apiKey: config.apiKey,// REQUIRED
                region: config.region // REQUIRED
              });

              var params = {};

            var additionalParams = {
                headers: {
                    // 'Access-Control-Allow-Origin' : 'http://sneha-chat-bot.s3-website-us-east-1.amazonaws.com', // Required for CORS support to work
                    // 'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HTTPS
                }
            };
            var body =
                {"BotRequest":
                    {
                        "Message":
                        {
                            "UnstructuredMessage":
                            {
                                "Text":text,
                            }
                        }
                    }
                }
            console.log(body);

            apigClient.chatbotPost(params, body, additionalParams)
                .then(function(result){

                  console.log(result.data)
                  var2 = result.data;
                  sendMessage(var2);

                }).catch( function(result){
                  // Add error callback code here.
                  console.log("error");
                });


          // var xhttp = new XMLHttpRequest();
          // xhttp.onreadystatechange = function() {
          //   if (this.readyState == 4 && this.status == 200) {
          //      var2 = this.responseText;
          //      sendMessage(var2);
          //   }
          // };


          // xhttp.open("POST","https://aschc0r9ke.execute-api.us-east-1.amazonaws.com/chatapi/chatbot", true);
          // xhttp.send(JSON.stringify(req));
        };

        $('.send_message').click(function (e) {
            return load(getMessageText());
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return load(getMessageText());
            }
        });
        sendMessage('Hi there! How can I help you today? :)');
    });
}.call(this));
