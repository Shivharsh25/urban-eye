# Urban EYE - YOLOv8 Model Weights Directory

Place your trained YOLOv8 PyTorch model weights file (`.pt`) inside this directory.

## Integration Steps

1. Export or copy your trained YOLOv8 model file here (e.g. `urban_eye_yolov8.pt` or `best.pt`).
2. Verify that your model's class indices map 1-to-1 with `../class_names.json`:
   - `0`: `pothole`
   - `1`: `garbage`
   - `2`: `water_leak`
   - `3`: `streetlight`
3. Configure the environment variables in `ai_service/.env`:
   ```bash
   USE_STUB_DETECTOR=false
   MODEL_PATH=models/urban_eye_yolov8.pt
   ```
4. Restart the FastAPI service:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

No changes in the backend or frontend are required! The system will immediately use your real model weights.
