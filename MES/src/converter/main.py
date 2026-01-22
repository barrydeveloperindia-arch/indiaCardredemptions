
import os
import shutil
import subprocess
import uuid
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.responses import FileResponse

app = FastAPI()

UPLOAD_DIR = "/tmp/uploads"
OUTPUT_DIR = "/tmp/outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/convert")
async def convert_file(file: UploadFile = File(...)):
    """
    Accepts a CAD file (SlideWorks, Parasolid, etc.), 
    Runs headless FreeCAD conversion,
    Returns the resulting STEP file.
    """
    job_id = str(uuid.uuid4())
    input_filename = f"{job_id}_{file.filename}"
    input_path = os.path.join(UPLOAD_DIR, input_filename)
    output_filename = f"{job_id}.step"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # Save Upload
    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}")

    # Run Conversion via Subprocess
    # We call the FreeCAD binary directly on the script
    script_path = "/app/fc_script.py"
    cmd = ["freecadcmd", script_path, input_path, output_path]
    
    print(f"Running command: {cmd}")
    
    try:
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=300 # 5 minute timeout
        )
        
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)

        if result.returncode != 0:
             # Check if output exists despite error (sometimes freecad complains but works)
             if not os.path.exists(output_path):
                 raise Exception(f"FreeCAD exited with code {result.returncode}. Stderr: {result.stderr}")

        if not os.path.exists(output_path):
            raise Exception("Output file was not created by FreeCAD.")

        return FileResponse(
            output_path, 
            filename=f"{os.path.splitext(file.filename)[0]}.step", 
            media_type="application/octet-stream"
        )
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Conversion timed out")
    except Exception as e:
        print(f"Conversion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup input
        if os.path.exists(input_path):
            os.remove(input_path)
        # We assume FastAPI FileResponse handles the file handle, 
        # but auto-delete of output usually requires a background task. 
        # For simplicity in this v1, we leave output in /tmp/outputs 
        # (It's a container, it resets eventually).
