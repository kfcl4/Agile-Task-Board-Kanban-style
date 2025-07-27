from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, tasks
from routers import users
from database import Base, engine
from models.project_models import Project
from models.task_models import Task
from models.user_models import User
Base.metadata.create_all(bind=engine)
from websocket.websocket_manager import router as websocket_router


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(users.router)

app.include_router(websocket_router, prefix="/ws")

@app.get("/ping")
def ping():
    return {"message": "pong"}
