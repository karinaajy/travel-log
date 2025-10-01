# Travel Log - Travel Diary Application

[中文版](./README.md) | English

A full-stack travel diary application based on interactive maps, allowing users to mark travel locations on the map, upload photos, and record travel experiences.

---

## 📋 Project Overview

### What have you developed?

This is a complete full-stack Web application that allows users to:
- Double-click on an interactive world map to mark travel locations
- Add title, description, comments, and visit date for each location
- Upload travel photos (supports drag-and-drop upload)
- View all travel records and visualize them on the map
- Switch between different map theme styles (Voyager, Light, Dark, OpenStreetMap)

---

## 🛠️ Technology Stack Details

### 1. What technology stack was used in your work or project experience?

#### **Frontend Technology Stack**
- **React 18.3.1** - Core framework for building user interfaces
- **Vite 7.1.6** - Modern frontend build tool providing fast development experience
- **React Leaflet 4.2.1** - React version of Leaflet map library
- **Leaflet 1.9.4** - Open-source interactive map JavaScript library
- **React Hook Form 7.62.0** - High-performance form validation library
- **ESLint** - Code quality and style checking tool

#### **Backend Technology Stack**
- **Node.js (>=18.0.0)** - JavaScript runtime environment
- **Express 4.19.2** - Web application framework
- **MongoDB + Mongoose 8.2.4** - NoSQL database and ODM
- **Multer 1.4.5** - Middleware for handling multipart/form-data, used for file uploads
- **Express Rate Limit 7.2.0** - API request rate limiting
- **Rate Limit Mongo 2.3.2** - MongoDB-based rate limit storage
- **Helmet 7.1.0** - Set HTTP security headers
- **CORS 2.8.5** - Cross-Origin Resource Sharing configuration
- **Morgan 1.10.0** - HTTP request logging middleware
- **Dotenv 16.4.5** - Environment variable management

#### **Development Tools**
- **Nodemon 3.1.0** - Automatically restart Node.js application
- **ESLint (Airbnb Config)** - Follow Airbnb JavaScript style guide

---

## 🏗️ Project Architecture

### 2. What kind of project was built?

This is a full-stack application with **frontend-backend separation architecture**:

```
travel-log/
├── client/                    # Frontend application (React + Vite)
│   ├── src/
│   │   ├── App.jsx           # Main application component, map display
│   │   ├── LogEntryForm.jsx  # Log form component
│   │   ├── API.js            # API call encapsulation
│   │   └── index.css         # Global styles
│   └── package.json
│
└── server/                    # Backend application (Express + MongoDB)
    ├── src/
    │   ├── api/
    │   │   └── logs.js       # Log routes and controllers
    │   ├── models/
    │   │   └── LogEntry.js   # MongoDB data model
    │   ├── middleware/
    │   ├── middlewares.js    # Error handling middleware
    │   └── index.js          # Server entry point
    ├── uploads/              # Image upload directory
    └── package.json
```

---

## 💡 Core Feature Implementation

### 3. What problems were solved using these technologies?

#### **Problem 1: Geographic Location Visualization**
**Solution:** 
- Use **React Leaflet** to integrate OpenStreetMap
- Implement custom map event listeners (double-click to add markers)
- Provide multiple map theme switching (Voyager, Light, Dark, OSM)

**Technical Implementation:**
```javascript
// Map double-click event listener
const MapEvents = ({ setAddEntryLocation }) => {
  useMapEvents({
    dblclick(e) {
      const { lat: latitude, lng: longitude } = e.latlng
      setAddEntryLocation({ latitude, longitude })
    },
  })
  return null
}
```

#### **Problem 2: Image Upload and Storage**
**Solution:**
- Backend uses **Multer** to handle file uploads
- Implement disk storage strategy with automatic unique filename generation
- Frontend supports drag-and-drop upload and file preview
- Add file size limit (5MB) and type validation

**Technical Implementation:**
```javascript
// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
```

#### **Problem 3: API Security**
**Solution:**
- Implement **API Key verification mechanism**
- Use **Helmet** to set secure HTTP headers
- Configure **CORS** to restrict cross-origin access
- Implement **Rate Limiting** (maximum 1 request per 10 seconds)

**Technical Implementation:**
```javascript
// API key verification
if (req.get('X-API-KEY') !== API_KEY) {
  res.status(401);
  throw new Error('UnAuthorized');
}

// Rate limiting
const limiter = rateLimit({
  store: new MongoStore({
    uri: DATABASE_URL,
    collectionName: 'rateLimits',
  }),
  max: 1,
  windowMs: 10000
});
```

#### **Problem 4: Data Validation and Integrity**
**Solution:**
- Use **Mongoose Schema** to define data models
- Implement field validation (latitude/longitude range, rating range)
- Frontend uses **React Hook Form** for form validation

**Data Model:**
```javascript
const logEntrySchema = new Schema({
  title: { type: String, required: true },
  description: String,
  comments: String,
  image: String,
  rating: { type: Number, min: 0, max: 10, default: 0 },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  visitDate: { required: true, type: Date },
}, { timestamps: true });
```

---

## 🎯 Project Goals

### 4. What is the goal of the project?

**Main Goals:**
1. **Record Travel Memories** - Provide an intuitive way to record and review travel experiences
2. **Geographic Visualization** - Visualize all travel locations on a map
3. **Multimedia Support** - Allow photo uploads to enrich travel records
4. **User-Friendly** - Provide a clean, modern user interface
5. **Data Persistence** - Securely store all travel data

**Application Scenarios:**
- Personal travel diary
- Travel blog content management
- Travel planning and review
- Geographic location data collection

---

## 🔧 Technology Selection Rationale

### 5. What technologies were used in different parts of the business and why?

#### **Frontend Selection**

| Technology | Selection Rationale |
|------|---------|
| **React** | Component-based development, virtual DOM improves performance, rich ecosystem |
| **Vite** | Faster build speed than Webpack, native ES module support, fast HMR refresh |
| **Leaflet** | Lightweight (only 38KB), open-source and free, mobile support, highly customizable |
| **React Hook Form** | Excellent performance (reduces re-renders), simple API, built-in validation |

**Why not Google Maps?**
- Leaflet + OpenStreetMap is completely free, no API Key required
- More lightweight, faster loading
- Open-source community support, more customizable

#### **Backend Selection**

| Technology | Selection Rationale |
|------|---------|
| **Express** | Lightweight and flexible, rich middleware ecosystem, gentle learning curve |
| **MongoDB** | Document database, suitable for storing unstructured data (like travel logs), easy to scale |
| **Mongoose** | Provides Schema validation, simplifies MongoDB operations, supports middleware and hooks |
| **Multer** | Express officially recommended file upload middleware, simple configuration, powerful features |

#### **Security Technologies**

| Technology | Purpose |
|------|------|
| **Helmet** | Automatically sets 12+ security-related HTTP headers, prevents common web vulnerabilities |
| **CORS** | Precisely controls cross-origin access, prevents unauthorized frontend access |
| **Rate Limiting** | Prevents API abuse and DDoS attacks |
| **API Key** | Simple and effective authentication mechanism, protects write operations |

---

## 🚧 Challenges and Solutions

### 6. What challenges were encountered in the business and how were they solved using technology?

#### **Challenge 1: Cross-Origin Resource Sharing (CORS) Issues**

**Problem Description:**
Frontend (localhost:5173) cannot access backend API (localhost:1337), browser blocks cross-origin requests.

**Solution:**
```javascript
// Configure CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
}));

// Helmet configuration allows cross-origin resources
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

**Technical Points:**
- CORS must be configured before Helmet
- Set `crossOriginResourcePolicy` to `cross-origin`
- Allow custom header `X-API-KEY`

---

#### **Challenge 2: Image Upload and Display**

**Problem Description:**
1. How to handle file uploads (not JSON)
2. How to securely store images
3. How to display uploaded images on the frontend

**Solution:**

**Backend:**
```javascript
// 1. Configure Multer storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

// 2. Add file validation
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// 3. Static file service
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**Frontend:**
```javascript
// 1. Use FormData to send files
const formData = new FormData();
formData.append('image', file);
formData.append('title', data.title);

// 2. Drag-and-drop upload support
const handleDrop = (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

// 3. Image preview
const previewUrl = URL.createObjectURL(file);
setImagePreview(previewUrl);
```

**Technical Points:**
- Use `FormData` instead of JSON to send files
- Generate unique filenames to avoid conflicts
- Provide static file service to access uploaded images
- Frontend implements drag-and-drop upload and real-time preview

---

#### **Challenge 3: Leaflet Icons Not Displaying**

**Problem Description:**
After packaging with Webpack/Vite, Leaflet default icon paths are incorrect, map markers don't display.

**Solution:**
```javascript
// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Create custom icons
const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
})
```

**Technical Points:**
- Use CDN links instead of local paths
- Create custom icons in different colors to distinguish states
- Gold icon represents saved logs
- Red icon represents new logs being created

---

#### **Challenge 4: API Rate Limit Storage**

**Problem Description:**
How to implement rate limiting in a distributed environment? Memory storage is lost after server restart.

**Solution:**
```javascript
// Use MongoDB to store rate limit data
const limiter = rateLimit({
  store: new MongoStore({
    uri: DATABASE_URL,
    collectionName: 'rateLimits',
    expireTimeMs: 10000,
  }),
  max: 1,
  windowMs: 10000
});
```

**Technical Points:**
- Use `rate-limit-mongo` to store limit data in MongoDB
- Support multiple server instances sharing limit data
- Automatic expiration cleanup of old records
- Prevent malicious users from frequent submissions

---

#### **Challenge 5: Coordinate Validation**

**Problem Description:**
Users may input invalid latitude/longitude coordinates, causing map display errors or database errors.

**Solution:**

**Frontend Validation:**
```javascript
// Validate coordinates on map click
if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
  console.warn('Invalid coordinates:', { latitude, longitude })
  return
}
```

**Backend Validation:**
```javascript
// Mongoose Schema validation
latitude: {
  type: Number,
  required: true,
  min: -90,
  max: 90,
},
longitude: {
  type: Number,
  required: true,
  min: -180,
  max: 180,
}
```

**Technical Points:**
- Double validation (frontend + backend)
- Use Mongoose built-in validators
- Provide clear error messages

---

## ✨ Core Feature Highlights

### Project Features

1. **Interactive Map Interface**
   - Double-click map to add travel markers
   - Support 4 map theme switching
   - Custom colored icon identification

2. **Travel Log Management**
   - Create logs with title, description, and comments
   - Set visit date
   - Rating system (0-10 points)

3. **Image Upload Functionality**
   - Support click selection and drag-and-drop upload
   - Real-time image preview
   - File size and type validation
   - 5MB file size limit

4. **Data Persistence**
   - MongoDB stores all log data
   - Automatic timestamps (creation and update time)
   - Image file local storage

5. **Security Protection**
   - API Key authentication
   - Request rate limiting
   - CORS cross-origin protection
   - Helmet security header settings

6. **Responsive Design**
   - Full-screen map layout
   - Pop-up form
   - Mobile-friendly

---

## 📊 Implementation Results

### Final Achievements

✅ **Feature Completeness**
- Implemented all core features (map, logs, image upload)
- Complete frontend-backend separation, easy to maintain and extend
- RESTful API design, compliant with industry standards

✅ **User Experience**
- Intuitive map interaction
- Smooth image upload experience
- Clear error messages and loading states
- Beautiful map theme selection

✅ **Performance Optimization**
- Vite provides fast development and build experience
- React Hook Form reduces unnecessary re-renders
- Image size limit protects server resources
- Rate limiting prevents API abuse

✅ **Security**
- Multi-layer security protection (API Key + Rate Limit + CORS + Helmet)
- Data validation (frontend + backend double validation)
- File type and size restrictions

✅ **Scalability**
- Modular code structure
- Environment variable configuration
- Easy to add new features (such as user authentication, log editing/deletion, etc.)

---

## 🚀 Quick Start

### Environment Requirements
- Node.js >= 18.0.0
- MongoDB
- npm or yarn

### Installation Steps

1. **Install Dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

2. **Configure Environment Variables**
```bash
# Backend server/.env
NODE_ENV=development
PORT=1337
DATABASE_URL=mongodb://localhost/travel-log
CORS_ORIGIN=http://localhost:5173
API_KEY=your_secret_key
```

3. **Start Application**
```bash
# Start MongoDB
mongod

# Start backend (Terminal 1)
cd server
npm run dev

# Start frontend (Terminal 2)
cd client
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:1337

---

## 📝 Usage Instructions

1. **Double-click** on the map to select a location
2. Fill in travel information in the pop-up form
3. Enter API Key (configured in `.env` file)
4. Optional: Upload travel photos (click or drag)
5. Click "Create Entry" to save
6. Saved logs will display as gold markers
7. Click markers to view details and photos

---

## 🔮 Future Improvement Directions

1. **User System**
   - User registration and login
   - JWT authentication
   - Personal log management

2. **Feature Enhancement**
   - Edit and delete logs
   - Log search and filtering
   - Tag and category system
   - Export log data

3. **Social Features**
   - Share logs to social media
   - Public/private log settings
   - Comment and like functionality

4. **Technical Optimization**
   - Image compression and optimization
   - CDN storage for images
   - Server-side rendering (SSR)
   - PWA support

---

## 📚 Technical Learning Summary

Through this project, I deeply learned and practiced:

1. **Full-stack Development Process** - Complete process from database design to frontend interaction
2. **Map Application Development** - Use and customization of Leaflet map library
3. **File Upload Handling** - Use of Multer middleware and FormData
4. **API Security Practices** - Implementation of multi-layer security protection mechanisms
5. **Modern Frontend Tools** - Vite, React Hooks, React Hook Form
6. **RESTful API Design** - API design compliant with REST specifications
7. **Error Handling and Validation** - Frontend and backend data validation and error handling
8. **Performance Optimization** - Optimization measures such as rate limiting and file size limits

---

## 📄 License

MIT

## 👤 Author

CJ R. <cj@null.computer> (https://w3cj.now.sh)
