from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.public_menu import router as public_menu_router


from app.api.auth import router as auth_router
from app.api.admin_debug import router as admin_debug_router
from app.api.admin_categories import router as admin_categories_router
from app.api.admin_items import router as admin_items_router
from app.api.admin_item_images import router as admin_item_images_router
from app.api.admin_shop_profile import router as admin_shop_profile_router
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.public_shop_profile import router as public_shop_profile_router


Path("uploads").mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Coffee Menu API", version="0.1.0")

# Dev-friendly CORS (we'll tighten later)
app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "*"
        
    ],
    # allow_credentials=True,
    allow_credentials=False,

    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(public_menu_router)
app.include_router(auth_router)
app.include_router(admin_debug_router)
app.include_router(admin_categories_router)
app.include_router(admin_items_router)
app.include_router(admin_item_images_router)
app.include_router(admin_shop_profile_router)
app.include_router(public_shop_profile_router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health():
    return {"status": "ok"}

frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "../frontend/dist")
if os.path.exists(frontend_build_path):
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="static")