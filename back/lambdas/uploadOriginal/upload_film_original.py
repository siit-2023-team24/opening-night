import os
import boto3
import base64
from datetime import datetime

s3_client = boto3.client('s3')

def create(event, context):
    film_id = event['filmId']
    file_name = event['fileName']
    bucket_name = os.environ['BUCKET_NAME']
    s3_response = s3_client.get_object(Bucket=bucket_name, Key=film_id + '_temp')
    file_content = base64.b64decode(s3_response['Body'].read())

    s3_client.put_object(
        Bucket=bucket_name,
        Key=film_id,
        Body=file_content,
        ContentType='video/mp4',
        Metadata={
            'Name': file_name,
            'Type': 'video/mp4',
            'Size': f"{len(file_content)}B",
            'Time created': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Last modified': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
    )
