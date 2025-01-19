import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import SearchBar from "@/components/custom/searchBar";
import TimePicker from "@/components/custom/TimePicker";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaHJpZGF5MzMwIiwiYSI6ImNtNjJ5bDJxYjEyaWMybm9rYW5hbGtsam0ifQ.sjy7xcIkwP1i4vPum4M_1g";

const PlanTrip = () => {
  const [searchItem, setSearchItem] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [suggestions, setSuggestions] = useState([]);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [parkingLotMarkers, setParkingLotMarkers] = useState<mapboxgl.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

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

  const fetchParkingLots = async (center: [number, number]) => {
    // Clear existing markers
    parkingLotMarkers.forEach((marker) => marker.remove());
    setParkingLotMarkers([]);

    try {
      const response = await fetch(
        `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=parking-meters&geofilter.distance=${center[1]},${center[0]},1000`
      );
      const data = await response.json();

      if (data.records && data.records.length > 0) {
        console.log(data.records.slice(0,5))
        const closestParkingLots = data.records
          .slice(0, 5)
          .map((record: any) => ({
            coordinates: record.fields.geom.coordinates,
            name: record.fields.meter_id || "Parking Meter",
          }));

        const newMarkers = closestParkingLots.map((lot: any) => {
          const marker = new mapboxgl.Marker({ color: "blue" })
            .setLngLat(lot.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${lot.name}</h3>`))
            .addTo(map!);
          return marker;
        });

        setParkingLotMarkers(newMarkers);
      }
    } catch (error) {
      console.error("Error fetching parking lots:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchItem(value);
    fetchSuggestions(value);
  };

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
            duration: 800,
            zoom: 14,
          });

          new mapboxgl.Marker({ color: "black" })
            .setLngLat(center)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${place_name}</h3>`))
            .addTo(map);

          await fetchParkingLots(center);
        }
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
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

      fetchParkingLots(center);
    }
  };

  useEffect(() => {
    if (mapContainerRef.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [-123.16652, 49.26517], // Default center [lng, lat] (Vancouver)
        zoom: 12,
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
            onSearch={handleSearch}
            onChange={handleSearchChange}
            placeholder="Where do you want to go?"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-11/12 mt-1 shadow-lg">
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
