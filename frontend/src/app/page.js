"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
      const [spots, setSpots] = useState([]);
      useEffect(() => {
        axios.get("http://127.0.0.1:5000/parking")
          .then(response => setSpots(response.data))
          .catch(error => console.error("Error fetching data:", error));
      }, []);

      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold">Available Parking Spots</h1>
          <ul className="mt-4 space-y-2">
            {spots.map(spot => (
              <li key={spot.id} className="p-4 border rounded-md bg-gray-100">
                {spot.name} - {spot.available ? "Available" : "Reserved"}
              </li>
            ))}
          </ul>
        </div>
      );
}
