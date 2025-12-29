from flask import Flask, render_template, Response, jsonify, request
from flask_cors import CORS
from camera import VideoCamera
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global Camera Instance
# We use a global instance so the stats persist and can be accessed by API
camera = VideoCamera(0) # 0 for Webcam

@app.route('/')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        frame = camera.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
        else:
            time.sleep(0.1)

@app.route('/video_feed')
def video_feed():
    return Response(gen(camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/stats')
def get_stats():
    return jsonify({
        "stats": camera.stats,
        "model_name": camera.model_name
    })

@app.route('/api/toggle_settings', methods=['POST'])
def toggle_settings():
    data = request.json
    setting = data.get('setting')
    value = data.get('value')
    if setting in camera.settings:
        camera.settings[setting] = value
        return jsonify({"status": "success", "new_value": value})
    return jsonify({"status": "error", "message": "Invalid setting"}), 400

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    image_bytes = file.read()
    processed_image_bytes = camera.process_static_image(image_bytes)
    
    if processed_image_bytes:
        import base64
        encoded = base64.b64encode(processed_image_bytes).decode('utf-8')
        return jsonify({"image": encoded})
    
    return jsonify({"error": "Failed to process image"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
