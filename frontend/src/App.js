import React, { useState, useEffect } from 'react';
import { Map as LeafletMap, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import * as axios from 'axios'
import 'leaflet/dist/leaflet.css'
import './App.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;


const INITIAL_POSITION = [-22, -45];
const INITIAL_ZOOM = 7;

const client = axios.create({
  baseURL: 'http://127.0.0.1:3001/',
  timeout: 5000,
});


function App() {
  const [markers, setMarkers] = useState([])
  const [stsc, setStsc] = useState([])

  useEffect(() => {
    client.get('/aerodromes').then((res) => {
      setMarkers(res.data)
    })

    client.get('/tsc').then((res) => {
      setStsc(res.data)
    })
  }, [])

  return (
    <div className="App">
      <LeafletMap center={INITIAL_POSITION} zoom={INITIAL_ZOOM} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(marker => (<Marker position={[marker.latitude, marker.longitude]}>
          <Popup>
            {marker.metar_message}
            <br /><br />
            {marker.taf_message}
          </Popup>
        </Marker>))}
        {stsc.map(item => (
           <Circle 
           center={{lat: item.latitude, lng: item.longitude}}
           fillColor="blue" 
           radius={200}/>
        ))}
      </LeafletMap>
    </div>
  );
}

export default App;
