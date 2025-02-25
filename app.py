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

# Route to reserve parking
@app.route('/reserve', methods=['POST'])
def reserve_parking():
    data = request.json
    spot_id = data.get('spot_id')

    spot = ParkingSpot.query.get(spot_id)
    if not spot:
        return jsonify({"error": "Parking spot not found"}), 404
    if not spot.available:
        return jsonify({"error": "Parking spot is already reserved"}), 400

    spot.available = False
    db.session.commit()

    return jsonify({"message": "Parking spot reserved successfully", "spot_id": spot.id})

# Route to cancel reservation
@app.route('/cancel_reservation', methods=['POST'])
def cancel_reservation():
    data = request.json
    spot_id = data.get('spot_id')

    spot = ParkingSpot.query.get(spot_id)
    if not spot:
        return jsonify({"error": "Parking spot not found"}), 404
    if spot.available:
        return jsonify({"error": "Parking spot is already available"}), 400
    
    spot.available = True
    db.session.commit()

    return jsonify({"message": "Reservation canceled", "spot_id": spot.id})

from math import radians, cos, sin, sqrt, atan2

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # รัศมีโลก (กิโลเมตร)
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c  # ระยะทางเป็นกิโลเมตร

# Route to nearest parking
@app.route('/nearest', methods=['POST'])
def find_nearest_parking():
    data = request.json
    user_lat = data.get('latitude')
    user_lon = data.get('longitude')

    spots = ParkingSpot.query.filter_by(available=True).all()
    if not spots:
        return jsonify({"error": "No available parking spots"}), 404

    nearest_spot = min(spots, key=lambda spot: calculate_distance(user_lat, user_lon, spot.latitude, spot.longitude))
    
    return jsonify({
        "spot_id": nearest_spot.id,
        "name": nearest_spot.name,
        "distance_km": calculate_distance(user_lat, user_lon, nearest_spot.latitude, nearest_spot.longitude)
    })


if __name__ == '__main__':
    app.run(debug=True)
