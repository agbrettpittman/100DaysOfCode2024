from fastapi import FastAPI
from .routers import characters

app = FastAPI()

app.include_router(characters.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Layer of The Ancients!"}