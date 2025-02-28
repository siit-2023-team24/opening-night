import json
import os
import boto3

dynamodb = boto3.resource('dynamodb')

def create(body, context):
    film_id = body['filmId']

    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    table.put_item(
        Item = {
                'filmId': film_id,
                'fileName': body['fileName'],
                'title' : body['title'],
                'description' : body['description'],
                'actors' : body['actors'],
                'directors' : body['directors'],
                'genres' : body['genres'],
                'isSeries': body['isSeries'],
                'series': body.get('series', None),
                'season': body.get('season', None),
                'episode': body.get('episode', None)
            }
    )

    table_name = os.environ['SEARCH_TABLE_NAME']
    table = dynamodb.Table(table_name)

    genres = ""
    for g in body['genres']:
        genres += g + ','
    directors = ""
    for d in body['directors']:
        directors += d + ','
    actors = ''
    for a in body['actors']:
        actors += a + ','

    data = body['title'] + '-' + genres[:-1] + '-' + directors[:-1] + '-' + actors[:-1]

    table.put_item(
        Item = {
            'filmId': film_id,
            'data': data
        }
    )

    return {
          'filmId': film_id,
          'fileName' : body['fileName']
          }
