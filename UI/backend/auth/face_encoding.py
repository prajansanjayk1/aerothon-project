import base64
import json
import math
from typing import Optional, List, Dict, Any, Tuple
import numpy as np
try:
    import cv2
except ImportError:
    cv2 = None
try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh if mp else None
except ImportError:
    mp = None
    mp_face_mesh = None

def decode_base64_image(base64_str: str) -> Optional[np.ndarray]:
    """Decode a base64 encoded image string (with or without data URI scheme) into an OpenCV BGR image array."""
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_bytes = base64.b64decode(base64_str)
        img_arr = np.frombuffer(img_bytes, dtype=np.uint8)
        image = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None

def check_image_quality(image: np.ndarray) -> Dict[str, Any]:
    """Verify facial lighting, brightness, contrast, and sharpness."""
    if image is None or image.size == 0:
        return {"lighting_acceptable": False, "sharpness_acceptable": False, "brightness": 0.0, "sharpness": 0.0, "reason": "Empty image"}
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Calculate average luminance (brightness)
    brightness = float(np.mean(gray))
    lighting_acceptable = 35.0 <= brightness <= 235.0
    
    # Calculate Laplacian variance (sharpness / blur detection)
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    sharpness_acceptable = sharpness >= 45.0
    
    reason = "Nominal"
    if not lighting_acceptable:
        reason = "Poor lighting (too dark or overexposed)"
    elif not sharpness_acceptable:
        reason = "Image motion blur detected"
        
    return {
        "lighting_acceptable": lighting_acceptable,
        "sharpness_acceptable": sharpness_acceptable,
        "brightness": round(brightness, 1),
        "sharpness": round(sharpness, 1),
        "reason": reason
    }

def extract_face_landmarks_and_embedding(image: np.ndarray) -> Tuple[Optional[List[float]], Dict[str, Any]]:
    """
    Extract 468-point 3D facial landmarks using MediaPipe Face Mesh,
    verify face centering and eye visibility, and generate an L2-normalized numerical embedding vector.
    """
    if image is None:
        return None, {"face_detected": False, "face_centered": False, "eyes_visible": False, "reason": "No image provided"}
        
    quality_metrics = check_image_quality(image)
    if not quality_metrics["lighting_acceptable"]:
        return None, {
            "face_detected": False,
            "face_centered": False,
            "eyes_visible": False,
            "lighting_acceptable": False,
            "reason": quality_metrics["reason"]
        }

    h, w, _ = image.shape
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.65
    ) as face_mesh:
        results = face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return None, {
                "face_detected": False,
                "face_centered": False,
                "eyes_visible": False,
                "lighting_acceptable": quality_metrics["lighting_acceptable"],
                "reason": "Face Not Detected in webcam frame"
            }
            
        landmarks = results.multi_face_landmarks[0].landmark
        
        # Check face centering using nose tip landmark (#1)
        nose_tip = landmarks[1]
        face_centered = (0.20 <= nose_tip.x <= 0.80) and (0.15 <= nose_tip.y <= 0.85)
        
        # Check eyes visibility using left eye center (#468) and right eye center (#473) if available, or eyelids #33 and #263
        left_eye_outer = landmarks[33]
        right_eye_outer = landmarks[263]
        eyes_visible = (0.05 <= left_eye_outer.x <= 0.95) and (0.05 <= right_eye_outer.x <= 0.95)
        
        if not face_centered:
            return None, {
                "face_detected": True,
                "face_centered": False,
                "eyes_visible": eyes_visible,
                "lighting_acceptable": quality_metrics["lighting_acceptable"],
                "reason": "Face Not Centered in targeting reticule"
            }
            
        if not eyes_visible:
            return None, {
                "face_detected": True,
                "face_centered": True,
                "eyes_visible": False,
                "lighting_acceptable": quality_metrics["lighting_acceptable"],
                "reason": "Eyes Not Visible or obstructed"
            }

        # Generate translation-invariant and scale-invariant geometric facial embedding vector
        # Center all landmarks relative to nose tip (#1) and scale by inter-ocular distance (#33 to #263)
        inter_ocular_dist = math.sqrt((right_eye_outer.x - left_eye_outer.x)**2 + (right_eye_outer.y - left_eye_outer.y)**2 + 1e-6)
        
        raw_vector = []
        for lm in landmarks[:468]: # Use 468 standard mesh points
            norm_x = (lm.x - nose_tip.x) / inter_ocular_dist
            norm_y = (lm.y - nose_tip.y) / inter_ocular_dist
            norm_z = (lm.z - nose_tip.z) / inter_ocular_dist
            raw_vector.extend([norm_x, norm_y, norm_z])
            
        # L2-normalize the embedding vector
        vec_array = np.array(raw_vector, dtype=np.float32)
        norm = np.linalg.norm(vec_array)
        if norm > 0:
            vec_array = vec_array / norm
            
        embedding_list = [float(val) for val in vec_array]
        
        return embedding_list, {
            "face_detected": True,
            "face_centered": True,
            "eyes_visible": True,
            "lighting_acceptable": True,
            "sharpness_acceptable": quality_metrics["sharpness_acceptable"],
            "brightness": quality_metrics["brightness"],
            "reason": "Nominal • High Precision 3D Geometric Matrix Extracted"
        }

def serialize_embedding(embedding: List[float]) -> str:
    """Serialize embedding float list to JSON string for database storage."""
    return json.dumps(embedding)

def deserialize_embedding(embedding_str: str) -> Optional[List[float]]:
    """Deserialize JSON string from database back into embedding float list."""
    try:
        if not embedding_str:
            return None
        return json.loads(embedding_str)
    except Exception as e:
        print(f"Error deserializing embedding: {e}")
        return None
