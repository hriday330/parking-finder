import SearchBar from "@/components/custom/searchBar";
import TimePicker from "@/components/custom/TimePicker";
import { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = "pk.eyJ1IjoiaHJpZGF5MzMwIiwiYSI6ImNtNjJ5bDJxYjEyaWMybm9rYW5hbGtsam0ifQ.sjy7xcIkwP1i4vPum4M_1g"


const PlanTrip = () => {
  const [searchItem, setSearchItem] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = async () => {
    if (!searchItem.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchItem
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const { center, place_name } = data.features[0];
        if (map) {
          map.flyTo({
            center,
            zoom: 14,
          });


          const marker = new mapboxgl.Marker({ color: 'black'}).setLngLat(center).setPopup(
            new mapboxgl.Popup().setHTML(`<h3>${place_name}</h3>`)
          ).addTo(map);
          console.log("Marker added:", marker);
        }
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    if (mapContainerRef.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [-74.5, 40], // Default center [lng, lat]
        zoom: 9,
      });

      setMap(mapInstance);

      return () => mapInstance.remove();
    }
  }, []);

  return (
    <div>
      <div className="space-y-4">
        <div className="border-2 p-3">
          <h2 className="text-2xl font-semibold">Destination</h2>
          <SearchBar
            value={searchItem}
            onSearch={handleSearch}
            onChange={(e) => setSearchItem(e)}
            placeholder="Where do you want to go?"
          />
        </div>
        <div className="text-black grid grid-cols-2 space-x-2">
          <TimePicker
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            labelClassName="text-xl font-semibold"
            label="Depart at"
          />
          <TimePicker
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            labelClassName="text-xl font-semibold"
            label="Arrive at"
          />
        </div>
      </div>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "400px", marginTop: "20px" }}
      />
    </div>
  );
};

export default PlanTrip;