import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import SearchBar from "@/components/custom/searchBar";
import TimePicker from "@/components/custom/TimePicker";
import { haversineDistance } from "@/lib/distance";

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

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  const handleParkingLotClick = async (lot: any) => {
    const { coordinates } = lot;
    const address = await getAddressFromCoordinates(coordinates[0], coordinates[1])
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
  
      // Check if there are features in the response
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name; // Place name is typically the address
        console.log("Address:", address);
        return address;
      } else {
        console.log("No address found for these coordinates.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  console.log(selectedParkingLot)
  const fetchParkingLots = async (center: [number, number]) => {
    // Clear existing markers
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
    <div className="flex flex-col md:flex-row h-screen overflow-auto">
      {/* Left side: Map */}
      <div className="md:w-5/12 p-4">
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
          style={{ width: "100%", height: "calc(100vh - 500px)", marginTop: "20px" }}
        />
      </div>

      <div className="md:w-7/12 p-4 md:overflow-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Closest Parking Lots</h2>
        {parkingLots.length > 0 ? (
        <div className="space-x-2 grid grid-cols-2">
            {parkingLots.map((lot, index) => (
            <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200"
                onClick={() => handleParkingLotClick(lot)} 
            >
                <h3 className="text-lg font-semibold text-gray-800">{lot.name} #{index + 1}</h3>
                <p className="text-sm text-gray-600 mt-1">{lot.address}</p>
                <p className="text-sm text-gray-500 mt-1">{lot.timeInEffect}</p>
                <p className="text-sm text-gray-500 mt-1">DISTANCE: {lot.distance}</p>
            </div>
            ))}
        </div>
        ) : (
        <p className="text-gray-500">No parking lots found.</p>
        )}

        {selectedParkingLot && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold">{selectedParkingLot.name}</h3>
            <p className="text-sm text-gray-500">Time In Effect: {selectedParkingLot.timeInEffect}</p>
            <div className="mt-2">
            <h4 className="text-lg font-semibold">Rates:</h4>
            <ul className="list-disc pl-5">
                {selectedParkingLot.rates.map((rate: any, index: number) => (
                <li key={index} className="text-sm text-gray-500">
                    {rate.type}: ${rate.rate}
                </li>
                ))}
            </ul>
            </div>
            <p className="mt-2 text-sm text-gray-500">Distance: {selectedParkingLot.distance}</p>
            <span className="mt-2 font-semibold">Address: <label className="mt-2 text-sm text-gray-500"> {`${selectedParkingLot.address}`} </label></span>
        </div>
        )}
      </div>
    </div>
  );
};

export default PlanTrip;
