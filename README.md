# Network Intrusion Detection System (NIDS)

A Machine Learning-powered Network Intrusion Detection System that monitors network traffic in real time, classifies malicious activities, and provides an interactive dashboard for attack visualization and system monitoring.

## Features

### Real-Time Network Monitoring

* Captures live network packets using Scapy.
* Extracts network traffic features automatically.
* Continuously analyzes incoming traffic.

### Intrusion Detection

Detects the following traffic categories:

| Class  | Description                               |
| ------ | ----------------------------------------- |
| Normal | Legitimate network traffic                |
| DoS    | Denial of Service attacks                 |
| Probe  | Network scanning and reconnaissance       |
| R2L    | Remote-to-Local attacks                   |
| U2R    | User-to-Root privilege escalation attacks |

### Machine Learning Models

The system compares predictions from:

* Random Forest Classifier
* Linear Support Vector Machine (SVM)

### Dashboard Analytics

* Daily attack statistics
* Attack category distribution
* Historical activity tracking
* Network activity visualization

### Attack Simulation

* Generate test attack scenarios
* Compare Random Forest and SVM predictions
* View prediction probabilities

### System Monitoring

* CPU utilization
* Memory utilization
* Network traffic statistics

---

# Project Architecture

```text
┌──────────────────────┐
│ React Frontend       │
│ (Vite + Dashboard)   │
└──────────┬───────────┘
           │ REST API
           ▼
┌──────────────────────┐
│ FastAPI Backend      │
└──────────┬───────────┘
           │
 ┌─────────┼─────────┐
 │         │         │
 ▼         ▼         ▼
Scapy   ML Models  MongoDB
Packet  RF + SVM   Activity Logs
Sniffer
```

---

# Repository Structure

```text
Network-Intrusion-Detection-System
│
├── Server/
│   ├── main.py
│   ├── Routes/
│   │   ├── sniff.py
│   │   ├── Simulate.py
│   │   ├── dataset.py
│   │   └── userAttack.py
│   │
│   ├── models/
│   │   ├── random_forest_model.sav
│   │   └── Linear_SVM_model.sav
│   │
│   ├── datasets/
│   └── testing/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Technologies Used

## Backend

* Python
* FastAPI
* Scapy
* Pandas
* NumPy
* Scikit-Learn
* Pydantic

## Database

* MongoDB

## Frontend

* React
* Vite
* JavaScript

## Machine Learning

* Random Forest
* Linear SVM

---

# Installation

## Clone Repository

```bash
git clone https://github.com/sreeshanth-t999/Network-Intrusion-Detection-System.git
cd Network-Intrusion-Detection-System
```

---

# Backend Setup

Navigate to Server directory:

```bash
cd Server
```

Create virtual environment:

```bash
python -m venv .venv
```

Activate environment:

### Windows

```bash
.venv\Scripts\activate
```

### Linux / Mac

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# MongoDB Setup

Start MongoDB locally:

```bash
mongod
```

Default connection:

```text
mongodb://localhost:27017
```

Database:

```text
network_intrusion
```

Collections:

```text
network_activity
dos_activity
prob_activity
u2r_activity
r2l_activity
normal_activity
```

---

# Running Backend

Start FastAPI server:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Run application:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# API Endpoints

## Dashboard Data

```http
GET /dashboard
```

Returns attack statistics grouped by day.

---

## Network Activities

```http
GET /activities
```

Returns stored network activity logs.

---

## Dataset Information

```http
GET /dataset
```

Returns filtered dataset records.

---

## System Performance

```http
GET /system-performance
```

Returns:

* CPU Usage
* Memory Usage
* Network Statistics

---

## Attack Simulation

```http
POST /simulate
```

Example:

```json
{
  "type": "dos"
}
```

Supported types:

```text
normal
dos
probe
r2l
u2r
```

---

## Custom Attack Prediction

```http
POST /attackSimulate
```

Example:

```json
{
  "duration": 10,
  "protocol_type": "tcp",
  "services": "http",
  "flag": "SF",
  "src_byte": 500,
  "dstn_byte": 200,
  "logged_in": 1,
  "wrong_frag": 0,
  "same_dest_count": 5,
  "same_port_count": 3
}
```

---

# Machine Learning Pipeline

### Data Processing

* Protocol Encoding
* Service Encoding
* Flag Encoding
* Feature Vector Generation
* Feature Padding to 122 Dimensions

### Prediction

Two models perform classification:

1. Random Forest
2. Linear SVM

Both models provide:

* Predicted Attack Type
* Probability Scores
* Confidence Levels

---

# Real-Time Packet Sniffing

The packet sniffer:

* Captures TCP, UDP, and ICMP traffic.
* Extracts connection features.
* Tracks:

  * Duration
  * Source Bytes
  * Destination Bytes
  * Login Status
  * Fragment Errors
  * Destination Counts
  * Port Counts

Traffic is automatically classified and stored in MongoDB.

---

# Future Improvements

* Deep Learning Models (LSTM/CNN)
* Threat Severity Scoring
* Email/SMS Alerts
* Docker Deployment
* Role-Based Authentication
* Cloud Deployment
* SIEM Integration
* Real-Time Attack Notifications

---

# Author

### Sreeshanth T

GitHub:
https://github.com/sreeshanth-t999

---

# License

This project is intended for educational and research purposes.
