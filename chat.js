(function () {
    var Message;
    var userid_email;
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


    getParameterByName = function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    exchangeAuthCodeForCredentials = function({auth_code = getParameterByName("code"),
                                                        client_id = config.client_id,
                                                        identity_pool_id = config.identity_pool_id,
                                                        aws_region =config.region,
                                                        user_pool_id = config.user_pool_id,
                                                        cognito_domain_url= config.cognito_domain_url,
                                                        redirect_uri = config.redirect_uri}) {
            return new Promise((resolve, reject) => {
                var settings = {
                    url: `${cognito_domain_url}/oauth2/token`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        grant_type: 'authorization_code',
                        client_id: client_id,
                        redirect_uri: redirect_uri,
                        code: auth_code
                    }
                };

                $.ajax(settings).done(function (response) {
                    console.log('OAuth2 Token Call Responded');
                    console.log(response);
                    if (response.id_token) {
                        AWS.config.region = aws_region;
                        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                            IdentityPoolId : identity_pool_id,
                            Logins : {
                                [`cognito-idp.${aws_region}.amazonaws.com/${user_pool_id}`]: response.id_token
                            }
                        });

                        console.log({IdentityPoolId : identity_pool_id,
                            Logins : {
                                [`cognito-idp.${aws_region}.amazonaws.com/${user_pool_id}`]: response.id_token
                            }
                        });

                        AWS.config.credentials.refresh(function (error) {
                            console.log("Error",error);
                            if (error) {
                                reject(error);
                            } else {
                                console.log('Successfully Logged In');
                                resolve(AWS.config.credentials);
                            }
                        });
                    } else {
                        reject(response);
                    }
                    
                    var params = {
                    AccessToken: response.access_token /* required */
                    };
                    console.log('params');
                    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
                    cognitoidentityserviceprovider.getUser(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data);
                   userid_email= data.UserAttributes[2].Value.toString();          // successful response
                    console.log("acess token wala data");
                    // console.log(userid_email);
                    });
                });
            });
        };

    $(function () {
        let apigClient = {};
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


            console.log("Code = "+getParameterByName("code"));            

            console.log("Calling for auth credentials exchange");

            exchangeAuthCodeForCredentials({auth_code: getParameterByName("code"),
                                            client_id: config.client_id,
                                            identity_pool_id: config.identity_pool_id,
                                            aws_region: config.region,
                                            user_pool_id: config.user_pool_id,
                                            cognito_domain_url: config.cognito_domain_url,
                                            redirect_uri: config.redirect_uri})
            .then(function(response) { 
                console.log("Inside Then Function",response);
                console.log("accessKey yaahan");
                console.log(response.accessKeyId);
                apigClient = apigClientFactory.newClient({
                    accessKey: response.accessKeyId,
                    secretKey: response.secretAccessKey,
                    sessionToken: response.sessionToken,
                    region: config.region
                });

            })
            .catch(function(error) {
                console.log("Got error ... ");
                console.log("error = "+this.error);
                console.log("response = "+this.response);
            });

            console.log("Surpassed exchange auth token");

        load = function (text) {
            sendMessage(text);
            var params = {};
            var additionalParams = {headers: {}};
            var body =
                { "BotRequest":
                    {
                        "Message":
                        {
                            "UnstructuredMessage":
                            {
                                "Text":text,
                                "userid": userid_email
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
                alert("You are not logged in! Please log in");
                sendMessage("Error in connecting to server"); 
                  location.href= config.invokeUrl;
                  console.log("error");
                });




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
