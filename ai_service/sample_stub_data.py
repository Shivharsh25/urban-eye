"""
Sample deterministic stub detection generator for Urban EYE.
Provides structured Detection objects matching the JSON contract when USE_STUB_DETECTOR=true.
"""

from typing import List, Dict, Any
import hashlib

VALID_TYPES = ["pothole", "garbage", "water_leak", "streetlight"]

# Realistic deterministic sample sets
STUB_PROFILES: Dict[str, Dict[str, Any]] = {
    "pothole": {
        "type": "pothole",
        "confidence": 0.93,
        "bbox": {"x": 140, "y": 280, "width": 260, "height": 180}
    },
    "garbage": {
        "type": "garbage",
        "confidence": 0.89,
        "bbox": {"x": 200, "y": 320, "width": 310, "height": 220}
    },
    "water_leak": {
        "type": "water_leak",
        "confidence": 0.95,
        "bbox": {"x": 180, "y": 240, "width": 240, "height": 190}
    },
    "streetlight": {
        "type": "streetlight",
        "confidence": 0.91,
        "bbox": {"x": 320, "y": 80, "width": 120, "height": 300}
    }
}

def get_stub_detections(filename: str = "", image_bytes: bytes = b"") -> List[Dict[str, Any]]:
    """
    Returns a deterministic detection based on the image content or filename hint,
    defaulting to realistic issue detections.
    """
    fn_lower = filename.lower()
    
    for issue_type in VALID_TYPES:
        if issue_type in fn_lower or issue_type.replace("_", "") in fn_lower:
            return [dict(STUB_PROFILES[issue_type])]

    # If no filename hint, use hash of image bytes to cycle deterministically through realistic types
    if image_bytes:
        digest = int(hashlib.md5(image_bytes[:256]).hexdigest(), 16)
        chosen_type = VALID_TYPES[digest % len(VALID_TYPES)]
        profile = dict(STUB_PROFILES[chosen_type])
        # Add slight variation based on image length to make bboxes natural
        var = (len(image_bytes) % 20) - 10
        profile["bbox"] = {
            "x": max(10, profile["bbox"]["x"] + var),
            "y": max(10, profile["bbox"]["y"] + var),
            "width": max(50, profile["bbox"]["width"] + var),
            "height": max(50, profile["bbox"]["height"] + var)
        }
        return [profile]

    return [dict(STUB_PROFILES["pothole"])]
