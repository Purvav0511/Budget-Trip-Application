from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from flask_cors import CORS
import pyspark
from pyspark.sql import SparkSession
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import math
from decimal import Decimal
from amadeus import Client, ResponseError
import json
from json.encoder import INFINITY
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Tiy2113@localhost/cheapThrills'

db = SQLAlchemy(app)
CORS(app)

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


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"Event: {self.description}"
    
    def __init__(self, description):
        self.description = description

def format_event(event):
    return {
        "description": event.description,
        "id": event.id,
        "created_at": event.created_at

    }

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
        "email": person.email,
        "id": person.id,
        "created_at": person.created_at

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
    def __init__(self, name, email, budget, start_date, end_date, origin_city):
        self.name = name
        self.email = email
        self.budget = budget
        self.start_date = start_date
        self.end_date = end_date
        self.origin_city = origin_city

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
    

    
def calculateTrip(preference):
    location = preference.origin_city
    curr_city = Cities.query.filter_by(city_name=location)[0]
    print(curr_city)
    origin_airport = curr_city.airport_code
    latitude = float(curr_city.city_latitude)
    longitude = float(curr_city.city_longitude)
    start_date = preference.start_date
    end_date = preference.end_date
    diff = date(int(end_date.split('-')[0]), int(end_date.split('-')[1]), int(end_date.split('-')[2])) -  date(int(start_date.split('-')[0]), int(start_date.split('-')[1]), int(start_date.split('-')[2]))
    num_days = diff.days
    print(num_days)
    max_distance = num_days * 700
    # cities = Cities.query.order_by(Cities.id.asc()).all()
    city_list = []
    max_lat, min_lat, max_long, min_long = get_square_bounds(latitude, longitude, max_distance)
    print(max_lat, min_lat, max_long, min_long)
    cities = Cities.query.filter(Cities.city_latitude<=max_lat).filter(Cities.city_latitude>=min_lat).filter(Cities.city_longitude<=max_long).filter(Cities.city_longitude>=min_long).all()
    # for city in cities:
    #     new_lat = float(city.city_latitude)
    #     new_lon = float(city.city_longitude)
    #     dist = haversine_distance(latitude, longitude, new_lat, new_lon)
    #     if(dist<max_distance):
    #         city_list.append(city)

    if len(cities) < 10:
        city_list = cities
    else:
        city_list = random.sample(cities, 10)

    # city_list = cities[0:10]
    print("City_List: \n ",city_list)
    # poi_list = {}
    # for city in city_list:
    #     poi = Place_of_Interest.query.filter_by(city_id = city.id).all()
    #     poi_list[city] = poi
    # sorted_city_list = sorted(poi_list.items(), key=lambda x: x[1])
    result_cities = {}
    for city in city_list:
        price_to = findFlightPrices(curr_city.airport_code, city.airport_code, start_date)
        # price_to = 120
        price_from = findFlightPrices(city.airport_code, curr_city.airport_code, end_date)
        # price_from = 110
        avg_cost = Cities.query.filter_by(city_name=city.city_name)[0].average_cost
        if(price_to == 0 or price_from == 0):
            continue

        total_price = float(price_to) + float(price_from) + float(avg_cost)*float(num_days)
        actual_budget = float(preference.budget)
        if(total_price <= actual_budget):
            result_cities[city] = total_price
    
    sorted_city_list = sorted(result_cities.items(), key=lambda x: x[1])
    city_poi_list = []
    cnt=0
    for key, value in sorted_city_list:
        if cnt==5:
            break
        cnt = cnt+1
        city = key
        budget = value
        poi_list = []
        pois = Place_of_Interest.query.filter_by(city_id = city.id).all()
        for poi in pois:
            poi_list.append(poi.place_name)
        city_poi_list.append(format_city(city, poi_list, budget))
        

    print(json.dumps(city_poi_list))
    
    return json.dumps(city_poi_list)
    # return json.dumps(result_cities)


@app.route('/event', methods = ['POST'])
def create_event():
    description = request.json['description']
    event = Event(description)
    db.session.add(event)
    db.session.commit()
    return format_event(event)

@app.route('/events', methods = ['GET'])
def get_events():
    events = Event.query.order_by(Event.id.asc()).all()
    event_list = []
    for event in events:
        event_list.append(format_event(event))
    return {
        'events': event_list
    }

@app.route('/events/<id>', methods = ['GET'])
def get_event(id):
    event = Event.query.filter_by(id=id).one()
    formatted_event = format_event(event)
    return {
        'event': formatted_event
    }

@app.route('/events/<id>', methods = ['DELETE'])
def delete_event(id):
    event = Event.query.filter_by(id=id).one()
    db.session.delete(event)
    db.session.commit()
    return 'Event Deleted!'

@app.route('/events/<id>', methods = ['PUT'])
def update_event(id):
    event = Event.query.filter_by(id=id)
    description = request.json['description']
    event.update(dict(description = description, created_at = datetime.utcnow()))
    db.session.commit()
    return {
        'event': format_event(event.one())
    }

@app.route('/login', methods = ['POST'])
def create_user():
    name = request.json['name']
    email = request.json['email']
    person = Person(name, email)
    db.session.add(person)
    db.session.commit()
    return format_user(person)

@app.route('/preferences', methods = ['POST'])
def get_preferences():
    name = request.json['name']
    email = request.json['email']
    budget = request.json['budget']
    start_date = request.json['startDate']
    end_date = request.json['endDate']
    origin_city = request.json['originCity']
    preference = Preferences(name, email, budget, start_date, end_date, origin_city)

    return calculateTrip(preference)


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