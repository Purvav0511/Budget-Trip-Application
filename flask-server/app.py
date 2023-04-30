from hashlib import new
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from flask_cors import CORS
import pyspark
from pyspark.sql import SparkSession
from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import sessionmaker
import math
from decimal import Decimal
from amadeus import Client, ResponseError
import json
from json.encoder import INFINITY
import random
from flask_pymongo import PyMongo
from pymongo import MongoClient
from bson import json_util

# engine = create_engine("postgresql://postgres:sheenagarg9@localhost/")
# e = engine.connect().execute('CREATE DATABASE trial')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:sheenagarg9@localhost/cheapThrills'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/cheapThrills'

db = SQLAlchemy(app)
mongo = PyMongo(app)

CORS(app)

db_mongo = mongo.db['cheapThrills']
recommendations = db_mongo['recommendations']
flights = db_mongo['flights']

def app_context():
    with app.app_context():
        yield

app.app_context().push()

class Cities(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=False)
    city_name = db.Column(db.String(), nullable=False)
    city_latitude = db.Column(db.Float)
    city_longitude = db.Column(db.Float)
    airport_code = db.Column(db.String())
    average_cost = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"City: \t Name: {self.city_name} \t Code: {self.airport_code} \t Latitude: {self.city_latitude}"
    
    def __init__(self, city_id, city_name, city_latitude, city_longitude, airport_code, average_cost):
        self.id = city_id
        self.city_name = city_name
        self.city_latitude = city_latitude
        self.city_longitude = city_longitude
        self.airport_code = airport_code
        self.average_cost = average_cost

class CitiesEncoder(json.JSONEncoder):
        def default(self, o):
            return o.__dict__
        
def format_city(city, poi_list, actual_budget):
    return {
        "name": city.city_name,
        "airport_code": city.airport_code,
        "city_id": city.id,
        "latitude": city.city_latitude,
        "longitude": city.city_longitude,
        "poi": poi_list,
        "budget": actual_budget
    }

class Place_of_Interest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, nullable=True)
    place_name = db.Column(db.String(), nullable=False)

    def __repr__(self):
        return f"Place of Interest: \t Place: {self.place_name} \n"
    
    def __init__(self, city_id, place_name):
        self.city_id = city_id
        self.place_name = place_name

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(300), nullable=False)
    first_pref = db.Column(db.String(200), nullable=True)
    second_pref = db.Column(db.String(200), nullable=True)
    third_pref = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"Person: \n Name: {self.name}, \t Email: {self.email}"
    
    def __init__(self, name, email):
        self.name = name
        self.email = email

def format_user(person):
    return {
        "name": person.name,
        "email": person.email

    }

class Flight():
    def __init__(self, src, dest, price, date):
        self.src = src
        self.dest = dest
        self.price = price
        self.date = date
        self.timestamp = datetime.now()

def format_flight(flight):
    return {
        "source": flight.src,
        "destination": flight.dest,
        "price": flight.price,
        "date": flight.date,
        "timestamp": flight.timestamp

    }

# db.create_all()

# def createCityTable(df):
#     for i in range(df.count()):
#         city_id = df.collect()[i][0]
#         city_name = df.collect()[i][1]
#         city_latitude = df.collect()[i][2]
#         city_longitude = df.collect()[i][3]
#         airport_code = df.collect()[i][4]
#         average_cost = df.collect()[i][5]
#         city = Cities(float(city_id), city_name, float(city_latitude), float(city_longitude), airport_code, float(average_cost))
#         db.session.add(city)
#     db.session.commit()
#     return

# def createPOITable(df):
#     for i in range(df.count()):
#         city_id = df.collect()[i][0]
#         place_of_interest = df.collect()[i][1]
#         poi = Place_of_Interest(int(city_id), place_of_interest)
#         db.session.add(poi)
#     db.session.commit()
#     return
        
# spark = SparkSession.builder.appName("cheapThrills").getOrCreate()
# df = spark.read.csv("../Cities.csv")
# df.printSchema()
# print(df.head(5))
# createCityTable(df)

# df = spark.read.csv("../Place_of_Interest.csv")
# df.printSchema()
# print(df.head(5))
# createPOITable(df)

def get_square_bounds(lat, lon, distance):
    R = 6371.01 # Earth's radius in km
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    dist_rad = distance / R

    # Calculate maximum and minimum latitude
    max_lat = math.asin(math.sin(lat_rad) * math.cos(dist_rad) + math.cos(lat_rad) * math.sin(dist_rad) * math.cos(0))
    min_lat = math.asin(math.sin(lat_rad) * math.cos(dist_rad) + math.cos(lat_rad) * math.sin(dist_rad) * math.cos(math.pi))

    # Calculate maximum and minimum longitude
    max_lon = lon_rad + math.atan2(math.sin(math.pi/2) * math.sin(dist_rad) * math.cos(lat_rad), math.cos(dist_rad) - math.sin(lat_rad) * math.sin(max_lat))
    min_lon = lon_rad + math.atan2(math.sin(-math.pi/2) * math.sin(dist_rad) * math.cos(lat_rad), math.cos(dist_rad) - math.sin(lat_rad) * math.sin(min_lat))

    # Convert back to degrees
    max_lat = math.degrees(max_lat)
    min_lat = math.degrees(min_lat)
    max_lon = math.degrees(max_lon)
    min_lon = math.degrees(min_lon)

    return (max_lat, min_lat, max_lon, min_lon)

def haversine_distance(lat1, lon1, lat2, lon2):
    p = math.pi / 180
    a = 0.5 - math.cos((float(lat2) - float(lat1)) * p) / 2 + math.cos(float(lat1) * p) * math.cos(float(lat2) * p) * (1 - math.cos((float(lon2) - float(lon1)) * p)) / 2
    return 12742 * math.asin(math.sqrt(a))


class Preferences():
    def __init__(self, budget, start_date, end_date, origin_city):
        self.budget = budget
        self.start_date = start_date
        self.end_date = end_date
        self.origin_city = origin_city

def format_preference(preference):
    return {
        "budget": preference.budget,
        "originCity": preference.origin_city,
        "startDate": preference.start_date,
        "endDate": preference.end_date
    }

def findFlightPrices(src, dest, date):
    amadeus = Client()

    result = []
    try:
        '''
        Find the cheapest flights from NYC to BUF
        '''
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=src, destinationLocationCode=dest, departureDate=date, adults=1)
        result = response.data

        price = INFINITY
        for j in result:
            price = min(price, float(j['price']['total']))
        
        if price == INFINITY:
            return 0
        else:
            return price

    
    except ResponseError as error:
        print(error)
    
def calculateNumDays(preference):
    start_date = preference.start_date
    end_date = preference.end_date
    diff = date(int(end_date.split('-')[0]), int(end_date.split('-')[1]), int(end_date.split('-')[2])) -  date(int(start_date.split('-')[0]), int(start_date.split('-')[1]), int(start_date.split('-')[2]))
    num_days = diff.days
    return num_days

def addFlightObjectToDatabase(src, dest, price_to, price_from, start_date, end_date):
    flight_obj = Flight(src, dest, price_to, start_date)
    flights.insert_one(format_flight(flight_obj))

    flight_obj = Flight(dest, src, price_from, end_date)
    flights.insert_one(format_flight(flight_obj))

def createTargetCities(city_list, curr_city, preference, num_days):
    start_date = preference.start_date
    end_date = preference.end_date
    result_cities = {}
    for city in city_list:
        price_to = findFlightPrices(curr_city.airport_code, city.airport_code, start_date)
        # price_to = 120
        price_from = findFlightPrices(city.airport_code, curr_city.airport_code, end_date)
        # price_from = 110
        avg_cost = Cities.query.filter_by(city_name=city.city_name)[0].average_cost
        if(price_to == 0 or price_from == 0):
            continue
        addFlightObjectToDatabase(curr_city.city_name, city.city_name, price_to, price_from, start_date, end_date)
        total_price = float(price_to) + float(price_from) + float(avg_cost)*float(num_days)
        actual_budget = float(preference.budget)
        if(total_price <= actual_budget):
            result_cities[city] = total_price
    return result_cities

def createCityList(latitude, longitude, max_distance):
    city_list = []
    max_lat, min_lat, max_long, min_long = get_square_bounds(latitude, longitude, max_distance)
    cities = Cities.query.filter(Cities.city_latitude<=max_lat).filter(Cities.city_latitude>=min_lat).filter(Cities.city_longitude<=max_long).filter(Cities.city_longitude>=min_long).all()

    if len(cities) < 10:
        city_list = cities
    else:
        city_list = random.sample(cities, 10)

    return city_list

def createCityRecommendation(city, budget):
    poi_list = []
    pois = Place_of_Interest.query.filter_by(city_id = city.id).all()
    for poi in pois:
        poi_list.append(poi.place_name)
    return format_city(city, poi_list, budget)
        
    
def createRecommendations(result_cities, preference, user):
    sorted_city_list = sorted(result_cities.items(), key=lambda x: x[1])
    city_poi_list = []
    cnt=0
    for key, value in sorted_city_list:
        if cnt==5:
            break
        cnt = cnt+1
        city = key
        budget = value

        curr_city_recommendation = createCityRecommendation(city, budget)
        city_poi_list.append(curr_city_recommendation)
    ts = datetime.now()
    recommendations.insert_one({'user': format_user(user), 'preference': format_preference(preference), 'city': city_poi_list, 'timestamp': ts})
    return city_poi_list

def calculateTrip(user, preference):
    location = preference.origin_city
    curr_city = Cities.query.filter_by(city_name=location)[0]

    origin_airport = curr_city.airport_code
    latitude = float(curr_city.city_latitude)
    longitude = float(curr_city.city_longitude)

    num_days = calculateNumDays(preference)

    max_distance = num_days * 700

    city_list = createCityList(latitude, longitude, max_distance)

    result_cities = createTargetCities(city_list, curr_city, preference, num_days)

    city_poi_list = createRecommendations(result_cities, preference, user)
    
    return city_poi_list


# @app.route('/event', methods = ['POST'])
# def create_event():
#     description = request.json['description']
#     event = Event(description)
#     db.session.add(event)
#     db.session.commit()
#     return format_event(event)

# @app.route('/events', methods = ['GET'])
# def get_events():
#     events = Event.query.order_by(Event.id.asc()).all()
#     event_list = []
#     for event in events:
#         event_list.append(format_event(event))
#     return {
#         'events': event_list
#     }

# @app.route('/events/<id>', methods = ['GET'])
# def get_event(id):
#     event = Event.query.filter_by(id=id).one()
#     formatted_event = format_event(event)
#     return {
#         'event': formatted_event
#     }

# @app.route('/events/<id>', methods = ['DELETE'])
# def delete_event(id):
#     event = Event.query.filter_by(id=id).one()
#     db.session.delete(event)
#     db.session.commit()
#     return 'Event Deleted!'

# @app.route('/events/<id>', methods = ['PUT'])
# def update_event(id):
#     event = Event.query.filter_by(id=id)
#     description = request.json['description']
#     event.update(dict(description = description, created_at = datetime.utcnow()))
#     db.session.commit()
#     return {
#         'event': format_event(event.one())
#     }

@app.route('/login', methods = ['POST'])
def create_user():
    name = request.json['name']
    email = request.json['email']
    person = Person(name, email)
    db.session.add(person)
    db.session.commit()
    return format_user(person)

@app.route('/send_preferences', methods = ['POST'])
def get_preferences():
    name = request.json['name']
    email = request.json['email']
    budget = request.json['budget']
    start_date = request.json['startDate']
    end_date = request.json['endDate']
    origin_city = request.json['originCity']

    user = Person(name, email)

    preference = Preferences(budget, start_date, end_date, origin_city)
    past_search = get_past_searches(name, email)
    city_poi_list = calculateTrip(user, preference)
    curr_and_past_search = {"cities": city_poi_list, "past_search":past_search}
    return curr_and_past_search

def get_past_searches(name, email):
    city_objects = recommendations.find({'user':{'name': name, 'email': email}})
    city_objects = list(city_objects)
    print(len(city_objects))
    if len(city_objects) == 0:
        return {}
    else:
        past_search = json.loads(json_util.dumps(city_objects[0]))
        max_time = city_objects[0]['timestamp']
        for i in range(len(city_objects)):
            if city_objects[i]['timestamp'] > max_time:
                past_search = json.loads(json_util.dumps(city_objects[i]))
        return past_search
    

@app.route('/get-cities', methods = ['GET'])
def get_cities():
    cities = Cities.query.all()
    city_list = []
    for city in cities:
        city_list.append({'label': city.city_name, 'value': city.city_name})

    print(city_list)
    return city_list

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)