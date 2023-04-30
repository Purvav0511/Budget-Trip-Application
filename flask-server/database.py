from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from flask_cors import CORS
import pyspark
from pyspark.sql import SparkSession
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import Cities, Place_of_Interest

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123@localhost:5432/cheapThrills'

db = SQLAlchemy(app)
CORS(app)

def app_context():
    with app.app_context():
        yield

app.app_context().push()

db.create_all()
def createCityTable(df):
    for i in range(df.count()):
        city_id = df.collect()[i][0]
        city_name = df.collect()[i][1]
        city_latitude = df.collect()[i][2]
        city_longitude = df.collect()[i][3]
        airport_code = df.collect()[i][4]
        average_cost = df.collect()[i][5]
        city = Cities(float(city_id), city_name, float(city_latitude), float(city_longitude), airport_code, float(average_cost))
        db.session.add(city)
    db.session.commit()
    return

def createPOITable(df):
    for i in range(df.count()):
        city_id = df.collect()[i][0]
        place_of_interest = df.collect()[i][1]
        poi = Place_of_Interest(int(city_id), place_of_interest)
        db.session.add(poi)
    db.session.commit()
    return
        
spark = SparkSession.builder.appName("cheapThrills").getOrCreate()
df = spark.read.csv("../Cities.csv")
df.printSchema()
print(df.head(5))
createCityTable(df)

df = spark.read.csv("../Place_of_Interest.csv")
df.printSchema()
print(df.head(5))
createPOITable(df)