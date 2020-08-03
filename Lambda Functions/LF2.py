import http.client
import json
import urllib
import boto3
import datetime
import time
from botocore.vendored import requests
import http.client
import base64
import json
import boto3
import decimal

def lambda_handler(event, context): 
    #---------------------Code for SQS------------------------------------------------------
    sqs=boto3.resource('sqs')
    queue=sqs.get_queue_by_name(QueueName='ChatBotQueue')
    print('cxz')
    print(queue)
    for message in queue.receive_messages():
        print("for ke andar")
        final_string=json.loads(message.body)
    #print(final_string['Location'])
        print(message.body)
        location = final_string['Location']
    #print(Loc)
        cuisine = final_string['Cuisine']
        # print(Cuis)
        dining_time = final_string['Dining_time']
        no_of_people = final_string['Number_of_people']
        phone_number = final_string['Phone_Number']
        print('Yeh raha  data')
        # mail = final_string['mail']

        #receipt_handle = response_sqs['Messages'][0]['ReceiptHandle']
        #print("receipt handle mil gaya")
        # response_sqs = sqs.delete_message(
        # QueueUrl = 'https://sqs.us-east-1.amazonaws.com/431657491992/ChatBotQueue',
        # ReceiptHandle = receipt_handle
        # )
        # print("queue delete")
        message.delete()
        print('deleted') 
        


        headers = {'Authorization':'Bearer API Key here',}
        client = boto3.client('dynamodb')
        print("clientt yahan")
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        print("dynameo yahan")
        table= dynamodb.Table('dining_Suggestions')
        print("table yahan")
        
        # try:
        conn = http.client.HTTPSConnection("api.yelp.com")
        print("try ke andar")
        print("for ke yahan")
        url = "https://api.yelp.com/v3/businesses/search?term=" + str(cuisine) + "&location=" + str(location)
        print(url)
        print("url hit kiya")
        conn.request("GET",url, headers = headers)
        response=conn.getresponse()
        data=response.read()
        data = json.loads(data.decode("utf-8"))
        print("data mil gaya")
        restaurant_yelpdata =data["businesses"]
        #print(restaurant_yelpdata)
        print("restaurant_yelpdata ho gaya:")
        restaurant_name = []
        address_list = []
        for i in range(len(restaurant_yelpdata)):
            print("restaurant_yelpdata for ke andar")
            rest = restaurant_yelpdata[i]
            id = rest['id']
            Cuisine = rest['categories'][0]['title']
            Rating = decimal.Decimal(rest['rating'])
            NumberOfReviews = rest['review_count']
            Zipcode=rest['location']['zip_code']
            restaurant_address = rest['location']['address1']
            address_list.append(restaurant_address)
            # coordinates_latitude = rest['coordinates']['latitude']
            # coordinates_longitude = rest['coordinates']['longitude']
            name = rest['name']
            restaurant_name.append(name)
            print("sab  mil gaya")
            print(id, Cuisine, Rating, NumberOfReviews, Zipcode, name)
            response=table.put_item(Item={"categories":Cuisine,"id":id,"Rating":Rating,"review_count":NumberOfReviews,\
                                         "Zip Code":Zipcode,"Name":name})
            print("response")
            print(response)
                
        conn.close()
    
    # except as error:
        print("sns ab chalaenge")
        
          #-----------Message creation-----------------------------------------------------------------------------------------------------
        #will give a string as "1.) Rest1 at Location1, 2.) Rest2 at Location2, 3.)......"
        message = "Hello! Here are the top 3 suggestions for " + cuisine + " restaurants at " + dining_time + ": \n" \
                    + restaurant_name[0] + " located at " + address_list[0] + \
                    "\n" + restaurant_name[1] + " located at " + address_list[1] + \
                     "\n" + restaurant_name[2] + " located at " + address_list[2]

        print("message")
        print(message)
        
        # #------------------sns code--------------------------------------
        # client=boto3.client('sns')
        # print("client mein")
        # print(client)
        # # client.subscribe(TopicArn = 'arn:aws:sns:us-east-1:431657491992:SnehaSMSTopic', Protocol='SMS', Endpoint=phone_number)
        # # print("Subscribeing")
        # client.publish(Message = message, PhoneNumber = phone_number)
        # print("publishing hopefully pls")
