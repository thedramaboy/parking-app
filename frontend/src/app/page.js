"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
      const [spots, setSpots] = useState([]);
      const [userLocation, setUserLocation] = useState({latitude: "", longitude: ""});
      const [nearestSpot, setNearestSpot] = useState(null);

      useEffect(() => {
        axios.get("http://127.0.0.1:5000/parking")
          .then(response => setSpots(response.data))
          .catch(error => console.error("Error fetching data:", error));
      }, []);

      const reserveSpot = (spotId) => {
        axios.post("http://127.0.0.1:5000/reserve", {spot_id: spotId})
        .then(response => {
          alert("Parking spot reserved successfully!");
          setSpots(spots.map(spot =>
            spot.id === spotId ? {...spot, available: false} : spot
          ));
        })
        .catch(error => alert(error.response?.data?.error || "Something went wrong with a reservation."))
      };

      const cancelReservation = (spotId) => {
        axios.post("http://127.0.0.1:5000/cancel_reservation", {spot_id: spotId})
        .then(response => {
          alert("Reservation canceled successfully!");
          setSpots(spots.map(spot =>
            spot.id === spotId ? {...spot, available: true} : spot
          ));
        })
        .catch(error => alert(error.response?.data?.error || "Something went wrong with your cancellation."))
      };

      const findNearestSpot = () => {
        if (!userLocation.latitude || !userLocation.longitude) {
          alert("Please allow us to track your location.");
          return;
        }

        axios.post("http://127.0.0.1:5000/nearest", userLocation)
        .then(response => setNearestSpot(response.data))
        .catch(error => alert(error.response?.data?.error) || "Something went wrong with finding your nearest parking.")
      }

      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold">Available Parking Spots</h1>
          <ul className="mt-4 space-y-2">
            {spots.map(spot => (
              <li key={spot.id} className="p-4 border rounded-md bg-gray-100 flex justify-between items-center">
              <span>{spot.name} - {spot.available ? "Available" : "Reserved"}</span>
              {spot.available ? (
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                  onClick={() => reserveSpot(spot.id)}>
                  Reserve
                </button>
              ) : (
                <button 
                  className="bg-red-500 text-white px-3 py-1 rounded-md"
                  onClick={() => cancelReservation(spot.id)}>
                  Cancel
                </button>
              )}
            </li>
            ))}
          </ul>
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-bold">Find Nearest Parking Spot</h2>
            <div className="mt-4 flex space-x-2">
              <input 
                type="number" 
                placeholder="Latitude"
                value={userLocation.latitude}
                onChange={(e) => setUserLocation({ ...userLocation, latitude: e.target.value })}
                className="border p-2 rounded w-32"
              />
              <input 
                type="number" 
                placeholder="Longitude"
                value={userLocation.longitude}
                onChange={(e) => setUserLocation({ ...userLocation, longitude: e.target.value })}
                className="border p-2 rounded w-32"
              />
              <button 
                className="bg-green-500 text-white px-3 py-1 rounded-md"
                onClick={findNearestSpot}>
                Find
              </button>
            </div>

            {nearestSpot && (
              <div className="mt-4 p-4 border rounded-md bg-gray-100">
                <h2 className="text-lg font-bold">Nearest Parking Spot</h2>
                <p>Name: {nearestSpot.name}</p>
                <p>Distance: {nearestSpot.distance_km.toFixed(2)} km</p>
              </div>
            )}
          </div>
        </div>
      );
}
