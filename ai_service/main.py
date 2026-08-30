"""
Urban EYE - AI Detection Microservice (FastAPI)
Exposes POST /detect endpoint to run object detection for municipal issues:
- pothole
- garbage
- water_leak
- streetlight

Supports a clear integration seam:
- USE_STUB_DETECTOR=true (default): Returns realistic deterministic detections for full end-to-end testing.
- USE_STUB_DETECTOR=false: Loads YOLOv8 PyTorch model from MODEL_PATH using ultralytics and executes real inference.
"""

import os
import json
from pathlib import Path
from typing import List, Optional
import io
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from sample_stub_data import get_stub_detections

# ==========================================
# Configuration & Environment Variables
# ==========================================
USE_STUB_DETECTOR_ENV = os.getenv("USE_STUB_DETECTOR", "true").lower() in ("true", "1", "yes")
MODEL_PATH = os.getenv("MODEL_PATH", "models/urban_eye_yolov8.pt")
CLASS_NAMES_PATH = os.getenv("CLASS_NAMES_PATH", "class_names.json")

# Load Class Names
BASE_DIR = Path(__file__).resolve().parent
class_names_file = BASE_DIR / CLASS_NAMES_PATH
if class_names_file.exists():
    with open(class_names_file, "r", encoding="utf-8") as f:
        CLASS_NAMES = json.load(f)
else:
    CLASS_NAMES = ["pothole", "garbage", "water_leak", "streetlight"]

# Global model holder for real YOLOv8 model
yolo_model = None

if not USE_STUB_DETECTOR_ENV:
    try:
        from ultralytics import YOLO
        model_file_path = BASE_DIR / MODEL_PATH
        if model_file_path.exists():
            print(f"[Urban EYE AI] Loading YOLOv8 weights from: {model_file_path}")
            yolo_model = YOLO(str(model_file_path))
            print("[Urban EYE AI] Model successfully loaded.")
        else:
            print(f"[Urban EYE AI WARNING] Model path {model_file_path} not found. Falling back to stub mode.")
    except ImportError:
        print("[Urban EYE AI WARNING] ultralytics package not installed. Falling back to stub mode.")
    except Exception as e:
        print(f"[Urban EYE AI ERROR] Error loading YOLOv8 model: {e}. Falling back to stub mode.")

# ==========================================
# Pydantic Schemas (Strict Response Contract)
# ==========================================
class BoundingBox(BaseModel):
    x: float = Field(..., description="Top-left X coordinate in pixels")
    y: float = Field(..., description="Top-left Y coordinate in pixels")
    width: float = Field(..., description="Bounding box width in pixels")
    height: float = Field(..., description="Bounding box height in pixels")

class Detection(BaseModel):
    type: str = Field(..., description="Issue type: pothole | garbage | water_leak | streetlight")
    confidence: float = Field(..., description="Detection confidence score between 0.0 and 1.0")
    bbox: BoundingBox = Field(..., description="Bounding box coordinates")

class DetectResponse(BaseModel):
    detections: List[Detection] = Field(default_factory=list, description="List of detected municipal infrastructure issues")
    service_mode: str = Field("stub", description="Inference mode: stub or yolov8_real")

# ==========================================
# Inference Logic & Model Seam
# ==========================================
def run_inference(image_bytes: bytes, filename: str = "") -> List[dict]:
    """
    Executes detection on raw image bytes.
    - When USE_STUB_DETECTOR is True: returns structured sample detections.
    - When USE_STUB_DETECTOR is False: executes YOLOv8 model prediction.
    """
    use_stub = USE_STUB_DETECTOR_ENV or (yolo_model is None)

    if use_stub:
        # Stub branch for development and testing without weights
        return get_stub_detections(filename=filename, image_bytes=image_bytes)

    # =========================================================================
    # [YOLOv8 MODEL INFERENCE INTEGRATION SEAM]
    # =========================================================================
    # 1. Load image from bytes
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # 2. Run prediction via Ultralytics YOLOv8
    # conf=0.25 (confidence threshold), iou=0.45 (NMS threshold)
    results = yolo_model.predict(source=image, conf=0.25, verbose=False)
    
    detections: List[dict] = []
    if results and len(results) > 0:
        result = results[0]
        boxes = result.boxes
        if boxes is not None:
            for box in boxes:
                cls_idx = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                # Map class index to class name
                if 0 <= cls_idx < len(CLASS_NAMES):
                    detected_type = CLASS_NAMES[cls_idx]
                else:
                    detected_type = "pothole" # Default fallback
                
                # Extract coordinates (xyxy -> xywh)
                xyxy = box.xyxy[0].tolist() # [x1, y1, x2, y2]
                x1, y1, x2, y2 = xyxy[0], xyxy[1], xyxy[2], xyxy[3]
                w = x2 - x1
                h = y2 - y1

                detections.append({
                    "type": detected_type,
                    "confidence": round(conf, 4),
                    "bbox": {
                        "x": round(x1, 2),
                        "y": round(y1, 2),
                        "width": round(w, 2),
                        "height": round(h, 2)
                    }
                })

    # If model produced no detections above threshold, return empty list or fallback
    return detections
    # =========================================================================

# ==========================================
# FastAPI Application Initialization
# ==========================================
app = FastAPI(
    title="Urban EYE - AI Detection Service",
    description="Microservice for automated municipal issue detection (potholes, garbage, water leaks, streetlights)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Urban EYE AI Detection Microservice",
        "mode": "stub" if (USE_STUB_DETECTOR_ENV or yolo_model is None) else "yolov8_real",
        "classes": CLASS_NAMES
    }

@app.post("/detect", response_model=DetectResponse)
async def detect_issues(
    image: UploadFile = File(...),
    override_type: Optional[str] = Query(None, description="Optional debug override for stub testing")
):
    """
    Accepts an uploaded image file and returns detected issues with confidence and bounding boxes.
    """
    if not image:
        raise HTTPException(status_code=400, detail="No image file provided")

    try:
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        if override_type and override_type in CLASS_NAMES:
            raw_detections = get_stub_detections(filename=override_type, image_bytes=contents)
        else:
            raw_detections = run_inference(image_bytes=contents, filename=image.filename or "")

        mode = "stub" if (USE_STUB_DETECTOR_ENV or yolo_model is None) else "yolov8_real"

        return DetectResponse(
            detections=raw_detections,
            service_mode=mode
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
