# Aadhaar Drift Index (ADI)

## Project Overview
The **Aadhaar Drift Index (ADI)** is a system designed to detect hidden population stress through update behavior in the Aadhaar database. It processes Enrolment, Demographic Updates, and Biometric Updates to compute a drift score for each region.

This project includes:
- **Data Pipeline**: Python-based pipeline to process CSV data and compute ADI scores.
- **Backend API**: FastAPI application to serve processed data.
- **Frontend Dashboard**: React + Vite application for visualization.

## Architecture
- **Backend**: Python (FastAPI, Pandas, Scikit-learn) running on port 8000.
- **Frontend**: React (Vite, Recharts, Leaflet) running on port 5000 (proxied via Node server).
- **Data Source**: CSV files in `/data` folder.
- **Output**: Processed CSVs and JSONs in `/output`.

## Prerequisites
- Node.js (v20+)
- Python (v3.11+)

## Setup & Running

### 1. Data
Ensure your CSV datasets are present in the `data/` directory:
- `api_data_aadhar_enrolment_*.csv`
- `api_data_aadhar_demographic_*.csv`
- `api_data_aadhar_biometric_*.csv`

### 2. Install Dependencies
Dependencies are automatically installed. If you need to reinstall:
```bash
npm install
pip install -r backend/requirements.txt
```

### 3. Run Application (Development)
Start both Backend and Frontend with a single command:
```bash
npm run dev
```
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:5000/api` (proxied to 8000)

### 4. Build for GitHub Pages
To generate a static version of the frontend:
1. Ensure `output/json/` contains the generated JSON files (run the backend at least once).
2. Build the frontend:
   ```bash
   npm run build
   ```
3. Deploy the `dist/` folder to GitHub Pages.

## Common Errors
- **Backend unavailable**: Ensure the Python backend started correctly on port 8000. Check logs for `uvicorn` errors.
- **No Data**: Ensure CSV files are in the `data/` folder and match the naming pattern.
- **Proxy Error**: If the frontend says "Backend unavailable", wait a few seconds for the Python server to start.

## Folder Structure
- `backend/`: Python code (pipeline and API).
- `client/`: React frontend source code.
- `server/`: Node.js server (serves frontend + proxies API).
- `shared/`: Shared types/schemas.
- `data/`: Input CSV files.
- `output/`: Processed data (CSVs and JSONs).
