import boto3
def lambda_handler(event, context):
    # user_id = event["messages"][0]["unstructured"]["id"]
    client = boto3.client('lex-runtime')
    response = client.post_text(
        botName='DiningBot',
        botAlias='SnehaDiningBot',
        userId="user_id",
        sessionAttributes={},
        requestAttributes={},
        # event.BotRequest.Message.UnstructuredMessage.Text;
        inputText = event["BotRequest"]["Message"]["UnstructuredMessage"]["Text"]
    )
    return response["message"]