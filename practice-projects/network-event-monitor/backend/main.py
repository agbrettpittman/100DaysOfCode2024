# Imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from utilities.dbConn import initialize_database
from utilities.active_event_tracker import active_event_tracker
from routers import events, widgetRouterRoot
import os

load_dotenv()
app = FastAPI()
env_origins = os.getenv("VALID_ORIGINS")
origins = env_origins.split(",") if env_origins else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_database()
app.include_router(events.router)
widgetRouterRoot.include_widget_routers()
app.include_router(widgetRouterRoot.router)
