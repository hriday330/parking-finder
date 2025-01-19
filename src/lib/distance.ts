export const haversineDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371; // Radius of Earth in km
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
  
    const toRad = (degree: number) => (degree * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in kilometers
  };
  