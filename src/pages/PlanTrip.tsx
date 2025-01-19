import SearchBar from "@/components/custom/searchBar";
import { useState } from "react";

function PlanTrip() {
    const [searchItem, setSearchItem] = useState('');
    return <div className="border-2 p-3">
       <h2 className="text-2xl font-semibold">Destination</h2>
       <SearchBar 
        value={searchItem} 
        onSearch = {() => setSearchItem('')} 
        onChange={(e) => setSearchItem(e)} 
        placeholder='Where do you want to go?' 
        />

        <div className="grid grid-cols-2">
            
        </div>
        
    </div>
}

export default PlanTrip;