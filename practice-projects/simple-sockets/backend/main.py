from fastapi import FastAPI
from .routers import rooms, candidates
from fastapi.middleware.cors import CORSMiddleware
from .database.db import initialize_database

app = FastAPI()

origins = [
    "http://localhost:3000",
]

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