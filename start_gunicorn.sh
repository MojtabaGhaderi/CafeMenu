#!/bin/bash
APP_DIR="/home/cafestreetah/cafe_app"
VENV="/home/cafestreetah/virtualenv/cafe_app/3.12"
PID_FILE="$APP_DIR/gunicorn.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Gunicorn already running (PID: $PID)"
        exit 0
    fi
fi

cd "$APP_DIR"
source "$VENV/bin/activate"
mkdir -p "$APP_DIR/logs"

exec gunicorn -c "$APP_DIR/gunicorn.conf.py" backend.app.main:app