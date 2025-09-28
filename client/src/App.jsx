import React, { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { listLogEntries } from './API'
import LogEntryForm from './LogEntryForm'

// 修复Leaflet默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// 自定义图标
const yellowIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
  shadowSize: [45, 45],
})

const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
  shadowSize: [45, 45],
})

// 地图点击事件组件
const MapEvents = ({ setAddEntryLocation }) => {
  useMapEvents({
    dblclick(e) {
      const { lat: latitude, lng: longitude } = e.latlng

      // 验证坐标范围
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        console.warn('Invalid coordinates:', { latitude, longitude })
        return
      }

      setAddEntryLocation({ latitude, longitude })
    },
  })
  return null
}

// 地图样式配置
const mapStyles = {
  voyager: {
    name: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  positron: {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  darkmatter: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
}

const App = () => {
  const [logEntries, setLogEntries] = useState([])
  const [addEntryLocation, setAddEntryLocation] = useState(null)
  const [currentMapStyle, setCurrentMapStyle] = useState('voyager')

  const getEntries = async () => {
    const logEntries = await listLogEntries()
    console.log('Loaded entries:', logEntries)
    setLogEntries(logEntries)
  }

  useEffect(() => {
    getEntries()
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 地图样式切换器 */}
      <div className='map-style-switcher'>
        {Object.entries(mapStyles).map(([key, style]) => (
          <button
            key={key}
            className={`style-btn ${currentMapStyle === key ? 'active' : ''}`}
            onClick={() => setCurrentMapStyle(key)}
          >
            {style.name}
          </button>
        ))}
      </div>

      <MapContainer
        center={[37.6, -95.665]}
        zoom={3}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          key={currentMapStyle}
          attribution={mapStyles[currentMapStyle].attribution}
          url={mapStyles[currentMapStyle].url}
          subdomains='abcd'
          maxZoom={20}
        />
        <MapEvents setAddEntryLocation={setAddEntryLocation} />

        {/* 显示所有旅行日志条目 */}
        {logEntries.map((entry) => (
          <Marker
            key={entry._id}
            position={[entry.latitude, entry.longitude]}
            icon={yellowIcon}
          >
            <Popup>
              <div className='popup'>
                <h3>{entry.title}</h3>
                <p>{entry.comments}</p>
                <small>
                  Visited on: {new Date(entry.visitDate).toLocaleDateString()}
                </small>
                {entry.image && (
                  <img
                    src={
                      entry.image.startsWith('http')
                        ? entry.image
                        : `http://localhost:1337${entry.image}`
                    }
                    alt={entry.title}
                    style={{
                      width: '100%',
                      maxWidth: '200px',
                      height: 'auto',
                      marginTop: '8px',
                      borderRadius: '4px',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src)
                      e.target.style.display = 'none'
                    }}
                    onLoad={() =>
                      console.log('Image loaded successfully:', entry.image)
                    }
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 显示添加新条目的标记 */}
        {addEntryLocation && (
          <Marker
            position={[addEntryLocation.latitude, addEntryLocation.longitude]}
            icon={redIcon}
          >
            <Popup>
              <div className='popup'>
                <LogEntryForm
                  onClose={() => {
                    setAddEntryLocation(null)
                    getEntries()
                  }}
                  location={addEntryLocation}
                />
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default App
