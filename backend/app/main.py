from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="TaskTrack API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)

class Task(TaskCreate):
    id: int
    completed: bool = False
    created_at: datetime

_tasks: Dict[int, Task] = {}
_next_id = 1

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate):
    global _next_id
    task = Task(
        id=_next_id,
        title=payload.title,
        description=payload.description,
        completed=False,
        created_at=datetime.utcnow(),
    )
    _tasks[_next_id] = task
    _next_id += 1
    return task

@app.get("/tasks", response_model=List[Task])
def list_tasks():
    return list(_tasks.values())

@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="TaskTrack API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)

class Task(TaskCreate):
    id: int
    completed: bool = False
    created_at: datetime

_tasks: Dict[int, Task] = {}
_next_id = 1

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate):
    global _next_id
    task = Task(
        id=_next_id,
        title=payload.title,
        description=payload.description,
        completed=False,
        created_at=datetime.utcnow(),
    )
    _tasks[_next_id] = task
    _next_id += 1
    return task

@app.get("/tasks", response_model=List[Task])
def list_tasks():
    return list(_tasks.values())

@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/tasks/{task_id}", response_model=Task)
def patch_task(task_id: int, completed: Optional[bool] = None):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = task.model_copy(update={"completed": task.completed if completed is None else completed})
    _tasks[task_id] = updated
    return updated

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    del _tasks[task_id]
    return None

@app.patch("/tasks/{task_id}", response_model=Task)
def patch_task(task_id: int, completed: Optional[bool] = None):
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = task.model_copy(update={"completed": task.completed if completed is None else completed})
    _tasks[task_id] = updated
    return updated

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    del _tasks[task_id]
    return None
