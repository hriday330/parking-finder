import SearchBar from "@/components/custom/searchBar";
import TimePicker from "@/components/custom/TimePicker";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaHJpZGF5MzMwIiwiYSI6ImNtNjJ5bDJxYjEyaWMybm9rYW5hbGtsam0ifQ.sjy7xcIkwP1i4vPum4M_1g";

const PlanTrip = () => {
  const [searchItem, setSearchItem] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [suggestions, setSuggestions] = useState([]);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounce function to delay API calls
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch suggestions from Mapbox API
  const fetchSuggestions = debounce(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchItem(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const { center, place_name } = suggestion;

    setSearchItem(place_name);
    setSuggestions([]);

    if (map) {
      map.flyTo({
        center,
        zoom: 14,
      });

      new mapboxgl.Marker({ color: "black" })
        .setLngLat(center)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${place_name}</h3>`))
        .addTo(map);
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
        <div className="border-2 p-3 relative">
          <h2 className="text-2xl font-semibold">Destination</h2>
          <SearchBar
            value={searchItem}
            onSearch={() => {}}
            onChange={handleSearchChange}
            placeholder="Where do you want to go?"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 shadow-lg">
              {suggestions.map((suggestion: any, index: number) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.place_name}
                </li>
              ))}
            </ul>
          )}
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
