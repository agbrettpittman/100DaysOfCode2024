from fastapi import FastAPI

app = FastAPI()

characters_db = {}


@app.get("/")
async def root():
    return {"message": "Welcome to Layer of The Ancients!"}