# Imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from utilities.dbConn import initialize_database
from utilities.eventManagement.event_handler import event_handler
from routers import events, widgets
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
widgets.include_widget_routers()
app.include_router(widgets.router)

@app.on_event("startup")
async def on_startup():
    await event_handler.activate()