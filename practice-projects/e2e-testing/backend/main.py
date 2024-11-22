from fastapi import FastAPI
from .routers import characters
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(characters.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Layer of The Ancients!"}