from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

# Create all tables
Base.metadata.create_all(bind=engine)

from routers import auth, workflows, steps, rules, executions

app = FastAPI(title="Flow Matrix API", version="1.0.0")

# CORS — must be added BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workflows.router)
app.include_router(steps.router)
app.include_router(rules.router)
app.include_router(executions.router)


@app.get("/")
def root():
    return {"message": "Flow Matrix API Running"}