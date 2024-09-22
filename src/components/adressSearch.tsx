// AddressSearch.tsx

import React, { useState } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places', 'geometry', 'drawing', 'visualization'] as any[];

const AddressSearch: React.FC<{ onSelect: (location: google.maps.LatLng) => void }> = ({ onSelect }) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  const handleLoad = (autocomplete: google.maps.places.Autocomplete) => {
    console.log('Autocomplete loaded:', autocomplete);
    setAutocomplete(autocomplete); // Set the loaded autocomplete instance
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace(); // Get place from autocomplete
      console.log('Place changed:', place);

      if (place.geometry && place.geometry.location) {
        onSelect(place.geometry.location); // Trigger onSelect with the selected location
        setInputValue(place.formatted_address || ''); // Update input field with formatted address
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyDFUn6EuiuNTZ0TsETQ-BhCpmMcvOA7FME" // Replace with your actual API key
      libraries={libraries} // Use correct libraries type
    >
      <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Rechercher une adresse"
          style={{ width: '100%', padding: '5px' }}
        />
      </Autocomplete>
    </LoadScript>
  );
};

export default AddressSearch;
