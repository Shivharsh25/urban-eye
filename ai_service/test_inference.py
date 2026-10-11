import glob
import os
import requests
from ultralytics import YOLO

def main():
    model_path = 'models/urban_eye_yolov8.pt'
    model = YOLO(model_path)
    print("==========================================")
    print("1. MODEL METADATA")
    print("==========================================")
    print("Trained model classes:", model.names)
    print("Number of classes:", len(model.names))

    upload_dir = '../backend/uploads'
    all_images = glob.glob(os.path.join(upload_dir, '*.jpg'))
    images = [img for img in all_images if os.path.getsize(img) > 1000][:10]

    print("\n==========================================")
    print(f"2. DIRECT MODEL INFERENCE ({len(images)} images)")
    print("==========================================")
    for img_path in images:
        fname = os.path.basename(img_path)
        # Test with standard confidence 0.25 and lower 0.10
        res = model.predict(img_path, conf=0.10, verbose=False)[0]
        boxes = res.boxes
        detections = []
        if boxes is not None and len(boxes) > 0:
            for b in boxes:
                c = int(b.cls[0].item())
                conf = float(b.conf[0].item())
                cls_name = model.names.get(c, str(c))
                detections.append(f"{cls_name} ({conf*100:.1f}%)")
        print(f"[{fname}] -> {detections if detections else 'None (below 10% conf)'}")

    print("\n==========================================")
    print("3. FASTAPI /detect ENDPOINT TEST (HTTP) WITH GARBAGE IMAGE")
    print("==========================================")
    garbage_img = os.path.join(upload_dir, '1788089248815_58931987e6cea2ce61af7ee9.jpg')
    with open(garbage_img, 'rb') as f:
        resp = requests.post(
            'http://localhost:8000/detect',
            files={'image': (os.path.basename(garbage_img), f, 'image/jpeg')}
        )
    print("HTTP Status Code:", resp.status_code)
    print("Response JSON:", resp.json())

    print("\n==========================================")
    print("4. FULL BACKEND PIPELINE TEST (/api/detect)")
    print("==========================================")
    login_resp = requests.post(
        'http://localhost:5000/api/auth/login',
        json={'email': 'admin@urbaneye.local', 'password': 'Admin@123456'}
    )
    if login_resp.status_code == 200:
        token = login_resp.json()['token']
        print("Login successful. Token acquired for:", login_resp.json()['user']['email'])
        with open(garbage_img, 'rb') as f:
            pipeline_resp = requests.post(
                'http://localhost:5000/api/detect',
                headers={'Authorization': f'Bearer {token}'},
                files={'image': (os.path.basename(garbage_img), f, 'image/jpeg')},
                data={'lat': '40.7128', 'lng': '-74.0060'}
            )
        print("Backend /api/detect Status Code (Garbage):", pipeline_resp.status_code)
        import json
        print("Backend /api/detect Result (Garbage):\n", json.dumps(pipeline_resp.json(), indent=2))

        print("\n==========================================")
        print("5. TEST WITH CLEAN IMAGE (NO DETECTIONS)")
        print("==========================================")
        clean_img = os.path.join(upload_dir, '1788086512197_0de106233fb701260e16cf62.jpg')
        with open(clean_img, 'rb') as f:
            clean_pipeline_resp = requests.post(
                'http://localhost:5000/api/detect',
                headers={'Authorization': f'Bearer {token}'},
                files={'image': (os.path.basename(clean_img), f, 'image/jpeg')},
                data={'lat': '40.7128', 'lng': '-74.0060'}
            )
        print("Backend /api/detect Status Code (Clean Image):", clean_pipeline_resp.status_code)
        print("Backend /api/detect Result (Clean Image):\n", json.dumps(clean_pipeline_resp.json(), indent=2))
    else:
        print("Failed to login:", login_resp.text)

if __name__ == '__main__':
    main()
