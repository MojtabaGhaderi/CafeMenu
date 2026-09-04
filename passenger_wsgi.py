import sys
import os

# Force virtualenv Python
INTERP = "/home/cafestreetah/virtualenv/cafe_app/3.12/bin/python3.12_bin"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))

os.environ.setdefault("PYTHONPATH", os.path.join(PROJECT_ROOT, "backend"))

# Bridge ASGI → WSGI for Passenger
from a2wsgi import ASGIMiddleware
from backend.app.main import app

application = ASGIMiddleware(app)