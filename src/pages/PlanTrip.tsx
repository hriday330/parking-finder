/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import SearchBar from "@/components/custom/SearchBar";
import TimePicker from "@/components/custom/TimePicker";
import { haversineDistance } from "@/lib/distance";
import { Button } from "@/components/ui/button";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaHJpZGF5MzMwIiwiYSI6ImNtNjJ5bDJxYjEyaWMybm9rYW5hbGtsam0ifQ.sjy7xcIkwP1i4vPum4M_1g";

const PlanTrip = () => {
  const [searchItem, setSearchItem] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [suggestions, setSuggestions] = useState([]);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [parkingLotMarkers, setParkingLotMarkers] = useState<mapboxgl.Marker[]>([]);
  const [parkingLots, setParkingLots] = useState<any[]>([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState<any | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleParkingLotClick = async (lot: any) => {
    const { coordinates } = lot;
    const address = await getAddressFromCoordinates(coordinates[0], coordinates[1]);
    setSelectedParkingLot({...lot, address: address});
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

  const getAddressFromCoordinates = async (longitude: number, latitude: number) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        return address;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const fetchParkingLots = async (center: [number, number]) => {
    parkingLotMarkers.forEach((marker) => marker.remove());
    setParkingLotMarkers([]);

    try {
      const response = await fetch(
        `https://opendata.vancouver.ca/api/records/1.0/search/?dataset=parking-meters&geofilter.distance=${center[1]},${center[0]},2000`
      );
      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const closestParkingLots = data.records
          .slice(0, 5)
          .map((record: any) => ({
            coordinates: record.fields.geom.coordinates,
            distance: `${haversineDistance(center,record.fields.geom.coordinates).toFixed(1)} km`,
            name: record.fields.meter_id || "Parking Meter",
            rates: [
              { type: "Mon-Fri 9a-6p", rate: record.fields.r_mf_9a_6p },
              { type: "Sat 9a-6p", rate: record.fields.r_sa_9a_6p },
              { type: "Mon-Fri 6p-10p", rate: record.fields.r_mf_6p_10 },
              { type: "Sat 6p-10p", rate: record.fields.r_sa_6p_10 },
              { type: "Sun 9a-6p", rate: record.fields.r_su_9a_6p },
            ],
            timeInEffect: record.fields.timeineffe,
            address: record.fields.geo_local_area,
          }));

          const newMarkers = closestParkingLots.map((lot: any) => {
            const marker = new mapboxgl.Marker({ color: "blue" })
              .setLngLat(lot.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>${lot.name}</h3>`))
              .addTo(map!);
          
            marker.getElement().addEventListener("click", () => handleParkingLotClick(lot));
          
            return marker;
          });

        setParkingLotMarkers(newMarkers);
        setParkingLots(closestParkingLots); 
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (mapContainerRef.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [-123.16652, 49.26517],
        zoom: 12,
      });

      setMap(mapInstance);

      return () => mapInstance.remove();
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full space-y-5">
      <div className="p-4 w-full max-w-screen-lg">
        <div className="space-y-4">
          <div className="border-2 p-3 relative">
            <h2 className="text-2xl font-semibold">Destination</h2>
            <SearchBar
              value={searchItem}
              className="w-8/12"
              onSearch={handleSearch}
              onChange={handleSearchChange}
              placeholder="Where do you want to go?"
            />
            <div ref={suggestionsRef}>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          className="w-screen h-[300px] lg:w-full lg:h-[500px] mt-5"
        />
      </div>

      <div className="p-4 overflow-x-auto flex space-x-4 py-4 w-full max-w-screen-lg">
        {parkingLots.length > 0 ? (
          parkingLots.map((lot, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 w-full sm:w-1/2 md:w-1/3 active:scale-95"
              onClick={() => handleParkingLotClick(lot)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{lot.name} #{index + 1}</h3>
              <p className="text-sm text-gray-600 mt-1">{lot.address}</p>
              <p className="text-sm text-gray-500 mt-1">{lot.timeInEffect}</p>
              <p className="text-sm text-gray-500 mt-1">DISTANCE: {lot.distance}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No parking lots found.</p>
        )}
      </div>

      {selectedParkingLot && (
        <div
            className={`p-6 bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-screen-lg transition-all duration-500 ease-in-out transform ${
            selectedParkingLot ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
        >
            <h3 className="text-3xl font-semibold text-gray-800">{selectedParkingLot.name}</h3>
            <p className="text-lg font-semibold text-gray-500">Time In Effect: {selectedParkingLot.timeInEffect}</p>
            <p className="mt-3 text-lg text-gray-500">Distance: {selectedParkingLot.distance}</p>
            <span className="mt-3 text-lg font-semibold">Address: 
            <label className="mt-2 text-lg text-gray-500"> {`${selectedParkingLot.address}`} </label>
            </span>
            <div className="mt-4">
            <h4 className="text-2xl font-semibold text-gray-800">Rates:</h4>
            <ul className="list-disc pl-6">
                {selectedParkingLot.rates.map((rate: any, index: number) => (
                <li key={index} className="text-lg text-gray-500">
                    {rate.type}: {rate.rate}
                </li>
                ))}
            </ul>
            </div>
            <Button className="mt-4 px-6 py-3 text-2xl text-white bg-blue-500 hover:bg-blue-600 rounded-lg">
            Let's go!
            </Button>
        </div>
        )}

    </div>
  );
};

export default PlanTrip;
