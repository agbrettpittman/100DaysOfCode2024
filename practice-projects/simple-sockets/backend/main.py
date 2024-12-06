import os
from fastapi import FastAPI
from .routers import rooms, candidates
from fastapi.middleware.cors import CORSMiddleware
from .database.db import initialize_database
from dotenv import load_dotenv

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

app.include_router(rooms.router)
app.include_router(candidates.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Who Won That!"}