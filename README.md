# 👁️ Urban EYE

> **Autonomous Smart-City Infrastructure Surveillance, Geospatial Deduplication & Instant Municipal Dispatch**

Urban EYE is a production-grade, camera-based intelligent surveillance platform that replaces slow, manual citizen complaint triage with automated detection, classification, geospatial duplicate clustering, and instant municipal work order dispatch.

The system detects **4 critical urban issue categories**:
1. **Potholes** (Road surface degradation)
2. **Garbage / Illegal Dumping** (Sanitation hazards)
3. **Water Leakages** (Hydrant bursts and main pipe ruptures)
4. **Faulty Streetlights** (Non-functional luminaires and public safety hazards)

---

## 🏛️ Architecture Overview

```
[ Citizen Camera / Webcam / File Upload ]
                   │
                   ▼ (Client-Side JPEG Compression: 1600px, 80% quality)
         [ Node.js API Gateway ]
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
[ Python FastAPI AI ]     [ Socket.io Real-Time Hub ]
(YOLOv8 Model Seam)       (Streams live 6-stage pipeline progress)
    │
    ▼
[ Rule-Based Severity Engine ]
(Evaluates Confidence, Bounding Box Area, Report Surge Counts)
    │
    ▼
[ 50m / 30-Day Geospatial Clustering ]
(Merges duplicate citizen reports, escalates severity on surge)
    │
    ▼
[ Department Routing & Work Order Generator ]
(departments.json mapping: Roads, Sanitation, Water, Electrical)
    │
    ▼
[ Automated Nodemailer / Ethereal Dispatch ]
(Generates verifiable email work orders & citizen resolution notices)
    │
    ▼
[ React + Leaflet Command Center Dashboard ]
(Live heatmap, pulsating severity pins, incident triage ledger)
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **Python** 3.10+ (with venv)
- *(Optional)* **Docker & Docker Compose**

### 1. Installation

#### A. Python AI Microservice:
```bash
cd ai_service
python -m venv .venv

# On Windows:
.venv\Scripts\pip install -r requirements.txt

# On Linux/macOS:
# source .venv/bin/activate && pip install -r requirements.txt
```

#### B. Node.js Backend API:
```bash
cd ../backend
npm install
```

#### C. React Frontend UI:
```bash
cd ../frontend
npm install
```

---

### 2. Database Seeding

Seed the database with 1 Admin account, 3 Citizen accounts, and 18 realistic pre-clustered & resolved sample detections across the city:

```bash
# From project root:
npm run seed

# Or inside backend/:
cd backend && npm run seed
```

---

### 3. Running Locally

Open 3 terminal windows (or run with Docker Compose):

**Terminal 1 — Python AI Detection Microservice (Port 8000):**
```bash
# Windows:
ai_service\.venv\Scripts\uvicorn main:app --app-dir ai_service --reload --port 8000

# Linux/macOS:
# source ai_service/.venv/bin/activate && uvicorn main:app --app-dir ai_service --reload --port 8000
```

**Terminal 2 — Node.js Backend API & Socket.io (Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 3 — React Command Center (Port 5173):**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

### 4. Running with Docker Compose (Alternative)

```bash
docker-compose up --build
```
All persistent data (MongoDB documents, uploaded citizen evidence images) is automatically stored in named Docker volumes.

---

## 🔑 Seeded Login Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **👑 Admin (Municipal Staff)** | `admin@urbaneye.local` | `Admin@123456` | Full command center, live heatmap, all incidents, administrative status triage |
| **👤 Citizen Reporter 1** | `sarah.jenkins@example.com` | `Citizen@123456` | Upload reports, live stepper, view own reports |
| **👤 Citizen Reporter 2** | `david.kumar@example.com` | `Citizen@123456` | Multi-reporter clustering & escalation |
| **👤 Citizen Reporter 3** | `elena.rodriguez@example.com` | `Citizen@123456` | Multi-reporter clustering & escalation |

> **Tip:** The Login page includes **one-click demo auto-fill buttons** for both Staff Admin and Citizen accounts.

---

## 🧠 Integrating Your Trained YOLOv8 Model (5-Minute Guide)

Urban EYE is built around an explicit, plug-and-play **integration seam** so dropping in your trained YOLOv8 PyTorch weights (`.pt`) requires zero code refactoring:

### Step 1: Place Your Model File
Drop your trained weights file into `ai_service/models/`:
```bash
ai_service/models/urban_eye_yolov8.pt
```

### Step 2: Confirm Class Order
Verify `ai_service/class_names.json` matches your training dataset's class index ordering:
```json
[
  "pothole",
  "garbage",
  "water_leak",
  "streetlight"
]
```

### Step 3: Switch Inference Mode
Edit `ai_service/.env`:
```env
USE_STUB_DETECTOR=false
MODEL_PATH=models/urban_eye_yolov8.pt
```

### Step 4: Restart the AI Service
```bash
# Windows
ai_service\.venv\Scripts\uvicorn main:app --app-dir ai_service --reload --port 8000
```

The entire downstream pipeline (Node backend, severity rules, geospatial deduplication, Nodemailer dispatch, WebSockets, React frontend) will immediately utilize your real model detections with **zero other changes**.

---

## 📡 Real-Time WebSockets Contract (Socket.io)

Urban EYE streams real-time events without requiring manual client refreshes:

| Event Name | Scope | Description |
| :--- | :--- | :--- |
| `pipeline:progress` | Request `jobId` & broadcast | Emitted across 6 granular stage boundaries (`received` → `detecting` → `geo-tagging` → `duplicate-check` → `routing` → `dispatched`) |
| `detection:created` | Broadcast | Brand-new municipal incident detected and work order dispatched |
| `detection:merged` | Broadcast & User Room | Duplicate report folded into existing incident; increments `reportCount` and triggers escalation if threshold reached |
| `detection:updated` | Broadcast & User Room | Incident status updated (e.g. marked `resolved` by admin; citizen receives live UI update) |

---

## 📧 Verifying Dispatched Emails (Nodemailer Ethereal)

Urban EYE executes **real email delivery** out-of-the-box without requiring third-party API keys or paid accounts:

1. Every automated dispatch generates a verifiable **Ethereal preview URL**.
2. Click **"Inspect"** on any incident card or row in the dashboard to open the **Incident Modal**.
3. Click the **"Open Email Preview"** button to view the actual dispatched work order rendered in your browser.
4. When an Admin marks an incident **"Resolved"**, resolution emails are automatically dispatched to **every citizen** who submitted that issue.

To connect a live department mailbox (e.g. Gmail, SendGrid, Amazon SES), set the SMTP variables in `backend/.env`:
```env
SMTP_HOST=smtp.yourmail.com
SMTP_PORT=587
SMTP_USER=dispatch@yourcity.gov
SMTP_PASS=your-secure-password
```

---

## 🔒 Security & Data Persistence

- **Bcrypt Password Hashing:** All passwords hashed with 10 salt rounds.
- **JWT Authorization:** Role-encoded tokens with backend middleware & frontend route guards.
- **Rate Limiting:** Protects `POST /api/detect` against burst abuse using `express-rate-limit`.
- **Permanent Data Persistence:** Dual-engine persistence layer guarantees 100% data durability across process restarts.
- **Client-Side Compression:** High-resolution mobile uploads are compressed in the browser before network transit.
