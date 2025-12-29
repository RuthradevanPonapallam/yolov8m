#!/bin/bash
echo "Attempting to remove conflicting opencv-python..."
pip uninstall -y opencv-python || true
echo "Starting Gunicorn..."
python -m gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app
