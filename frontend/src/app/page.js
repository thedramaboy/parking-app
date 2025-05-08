"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUpDash } from "lucide-react";

export default function Home() {
      const [spots, setSpots] = useState([]);
      const [userLocation, setUserLocation] = useState({latitude: "", longitude: ""});
      const [nearestSpot, setNearestSpot] = useState(null);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/parking`);
            console.log("API response:", response.data);
            setSpots(response.data);
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }, []);

      // useEffect(() => {
      //   setLoading(true);
      //   axios.get(`${API_URL}/parking`)
      //     .then(response => setSpots(response.data))
      //     .catch(error => console.error("Error fetching data:", error));
      // }, []);

      const reserveSpot = (spotId) => {
        axios.post((`${API_URL}/reserve`), {spot_id: spotId})
        .then(response => {
          alert("Parking spot reserved successfully!");
          setSpots(spots.map(spot =>
            spot.id === spotId ? {...spot, available: false} : spot
          ));
        })
        .catch(error => alert(error.response?.data?.error || "Something went wrong with a reservation."))
      };

      const cancelReservation = (spotId) => {
        axios.post((`${API_URL}/cancel_reservation`), {spot_id: spotId})
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

        axios.post((`${API_URL}/nearest`), userLocation)
        .then(response => setNearestSpot(response.data))
        .catch(error => alert(error.response?.data?.error) || "Something went wrong with finding your nearest parking.")
      }

      return (
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold">Available Parking Spots</h1>

            { loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading parking spots...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spots.map(spot => (
                <Card 
                key={spot.id} 
                className="bg-white shadow-xl rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700">{spot.name}</h2>
                    <p className="text-gray-500">{spot.price_per_hour} per hour</p>
                    <p className={`mt-2 font-bold ${spot.available ? "text-green-500" : "text-red-500"}`}>
                      {spot.available ? "Available" : "Reserved"}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        variant={spot.available ? "default" : "destructive"} 
                        className="mt-4 w-full"
                        onClick={() => spot.available ? reserveSpot(spot.id) : cancelReservation(spot.id)}
                      >
                        {spot.available ? "Reserve Now" : "Cancel Reservation"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            <div className="mt-6 p-6 bg-white shadow-md rounded-lg">
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
                  className="bg-green-500 text-white px-4 py-2 
                              rounded-md shadow-md hover:bg-green-600"
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
        </div>
      );
}
