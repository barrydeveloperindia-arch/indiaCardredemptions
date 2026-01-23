from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import time

router = APIRouter(prefix="/system", tags=["System Bridge"])

# Simple in-memory queue for demo purposes
command_queue = []

class CommandRequest(BaseModel):
    app: str # "excel", "fusion360", etc.
    args: str = ""

from fastapi import Response

@router.options("/command")
def options_command():
    return Response(
        content="OK", 
        media_type="text/plain", 
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

@router.post("/command")
def queue_command(cmd: CommandRequest, response: Response): # Import Response from fastapi if needed, implied from previous edit
    response.headers["Access-Control-Allow-Origin"] = "*"
    command_queue.append({
        "app": cmd.app,
        "args": cmd.args,
        "timestamp": time.time()
    })
    return {"status": "Queued", "queue_length": len(command_queue)}

@router.get("/poll-commands")
def poll_commands():
    # Return all pending commands and clear queue (Pop-all)
    # in a real system, we'd use IDs/Acks, but this is a simple bridge
    if not command_queue:
        return {"commands": []}
    
    current_batch = list(command_queue)
    command_queue.clear()
    return {"commands": current_batch}
