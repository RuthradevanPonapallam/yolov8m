from ultralytics import YOLO
import cv2
import cvzone
import math
import requests
import time
import threading

# --- Telegram Configuration ---
from dotenv import load_dotenv
import os

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
NOTIFICATION_COOLDOWN = 10
last_notification_time = {}

def send_telegram_message(message):
    """Sends a message via Telegram Bot in a separate thread."""
    if TELEGRAM_BOT_TOKEN == 'YOUR_BOT_TOKEN' or TELEGRAM_CHAT_ID == 'YOUR_CHAT_ID':
        print("Telegram token or chat ID not set. Skipping notification.")
        return

    def telegram_thread():
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print(f"Notification sent: {message}")
            else:
                print(f"Failed to send notification: {response.text}")
        except Exception as e:
            print(f"Error sending notification: {e}")

    threading.Thread(target=telegram_thread, daemon=True).start()

    """Sends a message via Telegram Bot."""
    if TELEGRAM_BOT_TOKEN == 'YOUR_BOT_TOKEN' or TELEGRAM_CHAT_ID == 'YOUR_CHAT_ID':
        print("Telegram token or chat ID not set. Skipping notification.")
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": "PERHATIAN !"
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print(f"Notification sent: {message}")
        else:
            print(f"Failed to send notification: {response.text}")
    except Exception as e:
        print(f"Error sending notification: {e}")

# --- Model 1 Setup (Obstacle_Self_Driving/best.pt) ---
#model_1 = YOLO(r"C:\Users\User\PycharmProjects\Object-Detection-Yolo\Obstacle_Self_Driving\best.pt")
#classNames_1 = ['bird', 'car', 'manhole', 'pedestrian', 'person', 'pothole', 'road crack', 'road damage', 'rubbish','traffic light', 'truck', 'van', 'wheel']

# --- Model 2 Setup (Self_Driving_Night/best.pt) ---
#model_2 = YOLO(r"C:\Users\User\PycharmProjects\Object-Detection-Yolo\Self_Driving_Night\best.pt")
#classNames_2 = ['arrow traffic sign', 'bus', 'car', 'cone', 'pedestrian', 'traffic light', 'wheel']

# --- Model 3 Setup (Self_Driving_Malaysia\best.pt") ---
model_3 = YOLO(r"C:\Users\User\PycharmProjects\Object-Detection-Yolo\Self_Driving_Malaysia\best.pt")
classNames_3 = ['car', 'manhole', 'pedestrian', 'person', 'speedbump', 'wheel']

# --- Unified Class Grouping and Color Coding (for visualization) ---
# Classes are categorized here for consistent output colors across all models.
HAZARD_CLASSES = ['pothole', 'road crack', 'road damage', 'rubbish', 'manhole', 'cone', 'speedbump'] # Hazards are RED
VEHICLE_CLASSES = ['car', 'truck', 'van', 'bus']                                                     # Vehicles are GREEN
TRAFFIC_SIGNS_AND_LIGHTS = ['traffic light', 'arrow traffic sign']                                   # Traffic Controls are ORANGE
PERSON_CLASSES = ['pedestrian', 'person']                                                            # People are YELLOW/CYAN
OTHER_CLASSES = ['bird', 'wheel']                                                                    # Others are BLUE

DEFAULT_COLOR = (255, 0, 0) # Blue

# --- Webcam COCO Model ---
webcam_model = YOLO("yolov8n.pt")
webcam_classNames = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train',
    'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter',
    'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear',
    'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
    'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat',
    'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut',
    'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
    'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase',
    'scissors', 'teddy bear', 'hair drier', 'toothbrush'
]

user_choice = input("Pilih sumber video:\n1 = Video file\n2 = Webcam\nMasukkan pilihan (1/2): ")

if user_choice == "2":
    cap = cv2.VideoCapture(0)
    print("Webcam detection started (Press 'q' to quit)")
else:
    video_path = r"C:\Users\User\Videos\Self Driving\stock-footage-malaysia-august-vehicles-slow-down-at-the-speed-bump-in-the-supermarket-area.mp4"
    cap = cv2.VideoCapture(video_path)
    print(f"Starting Object Detection on video: {video_path} (Press 'q' to quit')")


# Helper function to run inference on a specific model and aggregate results
def run_inference_and_aggregate(model, classNames, img, all_detections_list):
    """Runs inference on a model and appends detections to the list, using the model's specific class list."""

    # Setting confidence threshold to 0.5 (can be adjusted)
    results = model(img, stream=True, verbose=False, conf=0.5)
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_index = int(box.cls[0])
            box_cls_name = classNames[cls_index] # Uses the model's own class mapping
            box_conf = float(box.conf[0])
            # xyxy format: [x1, y1, x2, y2]
            box_coords = box.xyxy[0].tolist()

            # The confidence check is already handled by the model parameters above,
            # but we can keep the structure for clarity if needed.
            all_detections_list.append({
                'class': box_cls_name,
                'conf': box_conf,
                'coords': box_coords
            })

while True:
    success, img = cap.read()
    if not success:
        print("End of video stream or error reading frame.")
        break

    # List to store all combined detection results for the current frame
    all_detections = []

    if user_choice == "2":  # Webcam
        run_inference_and_aggregate(webcam_model, webcam_classNames, img, all_detections)
    else:  # Video file
        #run_inference_and_aggregate(model_1, classNames_1, img, all_detections)
        #run_inference_and_aggregate(model_2, classNames_2, img, all_detections)
        run_inference_and_aggregate(model_3, classNames_3, img, all_detections)

    # 4. Process and Draw All Combined Detections for Visualization
    for detection in all_detections:
        currentClass = detection['class']
        conf = detection['conf']
        x1, y1, x2, y2 = [int(c) for c in detection['coords']]
        w, h = x2 - x1, y2 - y1

        # --- Telegram Notification for Hazard ---
        if currentClass in HAZARD_CLASSES:
            current_time = time.time()
            last_time = last_notification_time.get(currentClass, 0)
            if current_time - last_time > NOTIFICATION_COOLDOWN:
                send_telegram_message(
                    f"⚠️ HAZARD DETECTED!\n"
                    f"Object: {currentClass}\n"
                    f"Confidence: {conf * 100:.1f}%"
                )
                last_notification_time[currentClass] = current_time

        # --- Color Coding Logic ---
        myColor = DEFAULT_COLOR

        if currentClass in HAZARD_CLASSES:
            myColor = (0, 0, 255)  # Red
        elif currentClass in VEHICLE_CLASSES:
            myColor = (0, 255, 0)  # Green
        elif currentClass in TRAFFIC_SIGNS_AND_LIGHTS:
            myColor = (255, 165, 0) # Orange
        elif currentClass in PERSON_CLASSES:
            myColor = (255, 255, 0) # Yellow/Cyan
        # Otherwise, it uses the DEFAULT_COLOR (Blue) for OTHER_CLASSES

        # Format confidence as a percentage string
        conf_str = f'{conf * 100:.1f}%'

        # Draw the bounding box and label
        cvzone.cornerRect(img, (x1, y1, w, h), l=9, rt=2, colorR=myColor)
        cvzone.putTextRect(img, f'{currentClass} {conf_str}',
                          (max(0, x1), max(35, y1)),
                          scale=1, thickness=1,
                          colorB=myColor,
                          colorT=(255, 255, 255),
                          colorR=myColor, offset=5)

    cv2.imshow("Object Detection", img)

    # Required for video playback: waits 1ms for a key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Stopping detection.")
        break

# Cleanup resources
cap.release()
cv2.destroyAllWindows()













