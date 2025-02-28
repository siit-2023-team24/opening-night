import json
import os
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

def rate(event, context):

    body = json.loads(event['body'])

    table_name = os.environ['RATINGS_TABLE_NAME']
    table = dynamodb.Table(table_name)
    timestamp = datetime.now().isoformat()
    
    try:
        table.put_item(
            Item = {
                'filmId': body['filmId'],
                'username': body['username'],
                'timestamp': timestamp,
                'stars': body['stars'],
                'genres': body['genres'],
                'directors': body['directors'],
                'actors': body['actors']
            }
        )
        status = 200
        message = 'Rating saved'

        queue_url = os.environ['CUSTOM_VAR']
        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=body['username']
        )

    except BaseException as e:
        print(e)
        status = 500
        message = "An error has occured while leaving the rating"

    response_body = {'message': message}
    return { 
        'statusCode': status, 
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(response_body, default=str)
        }
