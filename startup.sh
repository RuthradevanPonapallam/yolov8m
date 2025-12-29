#!/bin/bash
echo "Fixing OpenCV dependencies..."
pip uninstall -y opencv-python || true
pip install opencv-python-headless
echo "Starting Gunicorn..."
python -m gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app
