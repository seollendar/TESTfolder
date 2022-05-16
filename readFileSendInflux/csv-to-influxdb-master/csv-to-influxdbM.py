import datetime
import random
import time
import os
import csv
from csv import reader
import argparse
from influxdb import client as influxdb


db = influxdb.InfluxDBClient(host='localhost', port=8086, database='SmartPortData')


a = [1641890000000000000,304]

for metric in a:
    influx_metric = [{
        'measurement': 'kriso',
        'time': metric[0],
        'fields': {
             'value': metric[1]
        }
    }]
    db.write_points(influx_metric)