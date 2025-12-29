#!/bin/bash
echo "--- STARTUP SCRIPT EXECUTING (V3) ---"
echo "Cleaning up OpenCV installations..."
pip uninstall -y opencv-python || true
pip uninstall -y opencv-python-headless || true
echo "Installing fresh opencv-python-headless..."
pip install opencv-python-headless
echo "Starting Gunicorn..."
python -m gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app
