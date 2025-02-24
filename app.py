from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:0949810686@localhost/parking_db'
db = SQLAlchemy(app)

# Database Model
class ParkingSpot(db.Model):
    __tablename__ = 'parking_spots'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    price_per_hour = db.Column(db.Float, nullable=True)
    available = db.Column(db.Boolean, default=True)

# Route to home
@app.route('/')
def home():
    return "Welcome to the Parking API!"

# Route to get all parking spots
@app.route('/parking', methods=['GET'])
def get_parking_spots():
    spots = ParkingSpot.query.all()
    return jsonify([{
        'id': spot.id,
        'name': spot.name,
        'latitude': spot.latitude,
        'longitude': spot.longitude,
        'price_per_hour': spot.price_per_hour,
        'available': spot.available
    } for spot in spots])

# Route to get nearby parking spots
@app.route('/parking/nearby', methods=['GET'])
def get_nearby_parking():
    user_lat = float(request.args.get('lat'))
    user_lon = float(request.args.get('lon'))
    
    spots = ParkingSpot.query.all()
    nearby_spots = [spot for spot in spots if abs(spot.latitude - user_lat) < 0.01 and abs(spot.longitude - user_lon) < 0.01]
    
    return jsonify([{
        'id': spot.id,
        'name': spot.name,
        'latitude': spot.latitude,
        'longitude': spot.longitude,
        'price_per_hour': spot.price_per_hour,
        'available': spot.available
    } for spot in nearby_spots])

# Route to get details of a specific parking spot
@app.route('/parking/<int:id>', methods=['GET'])
def get_parking_details(id):
    spot = ParkingSpot.query.get_or_404(id)
    return jsonify({
        'id': spot.id,
        'name': spot.name,
        'latitude': spot.latitude,
        'longitude': spot.longitude,
        'price_per_hour': spot.price_per_hour,
        'available': spot.available
    })

if __name__ == '__main__':
    app.run(debug=True)
