from ultralytics import YOLO
import cv2
import cvzone
import math
import time
import threading
import requests
import numpy as np

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Global Configuration
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
NOTIFICATION_COOLDOWN = 10

# Classes
HAZARD_CLASSES = ['pothole', 'road crack', 'road damage', 'rubbish', 'manhole', 'cone', 'speedbump'] 
VEHICLE_CLASSES = ['car', 'truck', 'van', 'bus']
TRAFFIC_SIGNS_AND_LIGHTS = ['traffic light', 'arrow traffic sign']
PERSON_CLASSES = ['pedestrian', 'person']
OTHER_CLASSES = ['bird', 'wheel']

DEFAULT_COLOR = (255, 0, 0) # Blue

class VideoCamera:
    def __init__(self, source=0):
        # Initialize Video Capture
        try:
            self.video = cv2.VideoCapture(source)
            if not self.video.isOpened():
                print("Warning: Could not open video source.")
                self.video = None
        except Exception as e:
            print(f"Error opening video source: {e}")
            self.video = None
        
        # Load Models
        # Using the Model 3 path from original script as primary, fallback to yolov8n
        try:
            self.model = YOLO(r"Self_Driving_Malaysia/best.pt")
            self.classNames = ['car', 'manhole', 'pedestrian', 'person', 'speedbump', 'wheel']
            self.model_name = "Self_Driving_Malaysia_best.pt"
        except Exception as e:
            print(f"Custom model not found, falling back to yolov8n.pt: {e}")
            self.model = YOLO("yolov8n.pt")
            self.classNames = self.model.names if hasattr(self.model, 'names') else []
            self.model_name = "yolov8n.pt"

        # State Variables
        self.last_notification_time = {}
        self.stats = {
            "vehicles": 0,
            "hazards": 0,
            "pedestrians": 0,
            "speed": 0.0,
            "logs": []
        }
        self.settings = {
            "telegram_enabled": True,
            "audio_enabled": False
        }

    def __del__(self):
        self.video.release()

    def send_telegram_message(self, message):
        if not self.settings["telegram_enabled"]:
            return

        def telegram_thread():
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
            try:
                requests.post(url, json=payload)
            except Exception as e:
                print(f"Error sending notification: {e}")

        threading.Thread(target=telegram_thread, daemon=True).start()

    def process_frame(self, img):
        # Reset frame stats
        frame_stats = {"vehicles": 0, "hazards": 0, "pedestrians": 0}
        
        # Inference
        results = self.model(img, stream=True, verbose=False, conf=0.5)
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # 1. Class Info
                cls_index = int(box.cls[0])
                if cls_index < len(self.classNames):
                    box_cls_name = self.classNames[cls_index]
                else:
                    box_cls_name = "unknown"
                
                conf = float(box.conf[0])
                x1, y1, x2, y2 = [int(c) for c in box.xyxy[0].tolist()]
                w, h = x2 - x1, y2 - y1

                # 2. Update Stats
                if box_cls_name in VEHICLE_CLASSES:
                    frame_stats["vehicles"] += 1
                elif box_cls_name in HAZARD_CLASSES:
                    frame_stats["hazards"] += 1
                elif box_cls_name in PERSON_CLASSES:
                    frame_stats["pedestrians"] += 1

                # 3. Notifications & Logs
                if box_cls_name in HAZARD_CLASSES:
                    current_time = time.time()
                    last_time = self.last_notification_time.get(box_cls_name, 0)
                    if current_time - last_time > NOTIFICATION_COOLDOWN:
                        msg = f"⚠️ HAZARD DETECTED: {box_cls_name} ({conf*100:.1f}%)"
                        self.send_telegram_message(msg)
                        self.last_notification_time[box_cls_name] = current_time
                        
                        # Add to logs
                        log_entry = {
                            "id": str(time.time()),
                            "type": box_cls_name,
                            "confidence": float(conf),
                            "time": time.strftime("%H:%M:%S")
                        }
                        self.stats["logs"].insert(0, log_entry)
                        if len(self.stats["logs"]) > 20: self.stats["logs"].pop()

                # 4. Visualization Colors
                myColor = DEFAULT_COLOR
                if box_cls_name in HAZARD_CLASSES: myColor = (0, 0, 255)
                elif box_cls_name in VEHICLE_CLASSES: myColor = (0, 255, 0)
                elif box_cls_name in TRAFFIC_SIGNS_AND_LIGHTS: myColor = (255, 165, 0)
                elif box_cls_name in PERSON_CLASSES: myColor = (255, 255, 0)

                # Draw
                cvzone.cornerRect(img, (x1, y1, w, h), l=9, rt=2, colorR=myColor)
                cvzone.putTextRect(img, f'{box_cls_name} {conf*100:.1f}%',
                                  (max(0, x1), max(35, y1)),
                                  scale=1, thickness=1,
                                  colorB=myColor, colorT=(255, 255, 255),
                                  colorR=myColor, offset=5)

        # Update global stats (accumulate or replace? For dashboard, replace is usually better for "current view")
        self.stats["vehicles"] = frame_stats["vehicles"]
        self.stats["hazards"] = frame_stats["hazards"]
        self.stats["pedestrians"] = frame_stats["pedestrians"]
            
        # Mock Speed (Random walk for demo)
        self.stats["speed"] = max(0, min(120, self.stats["speed"] + np.random.uniform(-2, 2)))
        
        return img

    def get_frame(self):
        if self.video is None:
            # Create a black image
            img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(img, "Camera Unavailable (Server Mode)", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            ret, jpeg = cv2.imencode('.jpg', img)
            return jpeg.tobytes()

        success, img = self.video.read()
        if not success:
            return None
        
        img = self.process_frame(img)
        
        # Encode
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()

    def process_static_image(self, image_bytes):
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
            
        img = self.process_frame(img)
        
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()
