import os

bind = "127.0.0.1:8000"
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"

accesslog = "/home/cafestreetah/cafe_app/logs/access.log"
errorlog = "/home/cafestreetah/cafe_app/logs/error.log"
loglevel = "info"

proc_name = "cafe_app"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 100

daemon = True
pidfile = "/home/cafestreetah/cafe_app/gunicorn.pid"