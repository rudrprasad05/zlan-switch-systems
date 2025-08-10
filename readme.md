# Energy Meter Monitoring System

A comprehensive energy monitoring solution consisting of a web-based dashboard, REST API backend, and Modbus data collection service for SDM630 energy meters.

## Project Overview

### 🎯 System Architecture

```
[SDM630 Energy Meters] ←→ [ZLAN Gateway] ←→ [Data Collection Service] ←→ [FastAPI Backend] ←→ [Web Frontend]
```

### 📦 Components

1. **Frontend** - Web UI for displaying energy meter readings
2. **Backend** - FastAPI REST API with SQLite database
3. **Service** - Modbus TCP data collection from SDM630 meters

---

## 🖥️ Frontend

### Overview

A responsive web interface that displays real-time and historical energy meter data through interactive charts and tables.

### Features

- Real-time meter reading display
- Historical data visualization
- Multi-meter support
- Responsive design

### Setup

```bash
npm install
npm run dev
```

### Dependencies

- Modern web browser with ES6 support
- Backend API running and accessible on port 8000

### Access

- Open browser to `http://localhost:3000`
- Ensure backend is running on `http://localhost:8000`

---

## ⚙️ Backend

### Overview

FastAPI-based REST API that stores meter readings in SQLite database and serves data to the frontend.

### Features

- RESTful API endpoints
- SQLite database with SQLAlchemy ORM
- CORS support for frontend access
- Automatic database schema creation
- Data validation and error handling

### API Endpoints

- `POST /readings/` - Submit new meter readings
- `GET /readings/` - Retrieve meter readings (with optional filtering)
- `GET /readings/{meter_id}` - Get readings for specific meter
- `GET /meters/` - List all available meters

### Setup

```bash
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Dependencies

Create `requirements.txt`:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-multipart==0.0.6
```

Install with:

```bash
pip install -r requirements.txt
```

### Running

```bash
cd backend/

# Development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Database

- SQLite database file: `energy_meters.db`
- Automatically created on first run
- Schema managed by SQLAlchemy migrations

---

## 📡 Service (Data Collection)

### Overview

Python service that connects to SDM630 energy meters via ZLAN Modbus TCP gateway and posts readings to the backend API.

### Features

- Modbus TCP communication with ZLAN devices
- SDM630 energy meter support
- Configurable polling intervals
- Automatic retry and error handling
- Multiple meter support

### Setup

```bash
cd service/

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install pymodbus requests schedule python-dotenv
```

### Dependencies

Create `requirements.txt`:

```
pymodbus==3.5.2
requests==2.31.0
schedule==1.2.0
python-dotenv==1.0.0
```

### Configuration

Create `.env` file:

```env
# ZLAN Gateway Settings
MODBUS_HOST=192.168.1.100
MODBUS_PORT=502

# Backend API Settings
API_BASE_URL=http://localhost:8000
API_TIMEOUT=30

# Polling Settings
POLL_INTERVAL=60  # seconds

# Meter Configuration
METER_IDS=1,2,3  # Modbus slave IDs
```

### Running

```bash
cd service/

# Run the data collection service
python main.py

# Run as background service (Linux/macOS)
nohup python main.py &

```

---

## 🔄 Component Interaction Flow

### Data Flow

1. **Service** polls SDM630 meters via Modbus TCP through ZLAN gateway
2. **Service** formats data and sends POST requests to Backend API
3. **Backend** validates and stores readings in SQLite database
4. **Frontend** fetches data from Backend via GET requests
5. **Frontend** displays real-time and historical data to users

### Network Requirements

- Service must reach ZLAN gateway (typically `192.168.1.x`)
- Service must reach Backend API (`localhost:8000` or network IP)
- Frontend must reach Backend API (same origin or CORS-enabled)

---

## 🛠️ Development Tools

### Recommended VS Code Extensions

- **SQLite Viewer** - View and edit SQLite databases
- **Python** - Python language support
- **REST Client** - Test API endpoints directly in VS Code
- **Live Server** - Serve frontend files with auto-reload

### Database Management

```bash
# View database contents
sqlite3 backend/data.db

# Common SQLite commands
.tables                    # List tables
.schema readings          # Show table schema
SELECT * FROM readings;   # View all readings
.quit                     # Exit SQLite
```

### API Testing

```bash
# Test POST endpoint
curl -X POST "http://localhost:8000/readings/" \
  -H "Content-Type: application/json" \
  -d '{"meter_id": 1, "voltage": 230.5, "current": 5.2, "power": 1200.0, "energy": 1500.0}'

# Test GET endpoint
curl "http://localhost:8000/readings/"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start

- **Check port availability**: `netstat -an | grep :8000`
- **Virtual environment**: Ensure it's activated and dependencies installed
- **Database permissions**: Check write permissions in backend directory

#### Service Can't Connect to Meters

- **Network connectivity**: `ping <ZLAN_IP>`
- **Modbus configuration**: Verify ZLAN settings and meter IDs
- **Firewall**: Check if ports 502 (Modbus) and 8000 (API) are open

#### Frontend Shows No Data

- **Backend running**: Check `http://localhost:8000/docs`
- **CORS issues**: Verify CORS is enabled in FastAPI
- **Network requests**: Check browser developer tools for failed requests

#### Database Issues

- **File permissions**: Ensure SQLite file is writable
- **Disk space**: Check available disk space
- **Corrupted database**: Remove `.db` file to recreate (loses data)

### Logging and Debugging

#### Backend Logs

```bash
# Run with debug logging
uvicorn main:app --reload --log-level debug
```

#### Service Logs

```python
# Add to collector.py for detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Frontend Debugging

- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for API request failures

### Performance Optimization

#### Backend

- **Connection pooling**: Configure SQLAlchemy pool settings
- **Indexing**: Add database indexes for frequently queried columns
- **Caching**: Implement response caching for read-heavy endpoints

#### Service

- **Batch operations**: Collect multiple readings before API calls
- **Connection reuse**: Maintain persistent Modbus connections
- **Error handling**: Implement exponential backoff for failed requests

---

## 📚 Additional Resources

### Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PyModbus Documentation](https://pymodbus.readthedocs.io/)
- [SDM630 Manual](https://www.eastroneurope.com/products/view/sdm630modbus)

### Support

For issues and questions:

1. Check this README troubleshooting section
2. Review component logs for error details
3. Verify network connectivity and configurations
4. Consult component-specific documentation

---

## 🚀 Quick Start Guide

1. **Start Backend**:

   ```bash
   cd backend && pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Start Service**:

   ```bash
   cd service && pip install -r requirements.txt
   python collector.py
   ```

3. **Open Frontend**:

   ```bash
   cd frontend && python -m http.server 8080
   # Open http://localhost:8080
   ```

4. **Verify**: Check `http://localhost:8000/docs` for API documentation

---

_Last Updated: August 2025_
