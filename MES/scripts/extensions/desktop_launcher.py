
import os
import time
import requests
import subprocess
import platform

# Configuration
MES_URL = "http://localhost:8008/api/system/poll-commands"
POLL_INTERVAL = 3  # Seconds

# App Paths (Customize these for your specific PC environment)
APPS = {
    # Fusion 360: Executable inside the GUID folder
    "fusion360": r"C:\Users\pc\AppData\Local\Autodesk\webdeploy\production\6a0c9611291d45bb9226980209917c3d\Fusion360.exe",
    
    # IdeaMaker: Start Menu Shortcut
    "ideamaker": r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Raise3D\ideaMaker.lnk", 
    
    # Blender: Start Menu Shortcut
    "blender": r"C:\Users\pc\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Blender.lnk",
    
    # Excel: Updated based on user feedback
    "excel": r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE"
}

def find_executable(name):
    """Simple heuristic to find app if hardcoded path fails."""
    if name == "excel":
        return "excel" # Windows often knows 'excel' if in PATH
    return APPS.get(name)

def execute_command(cmd):
    app_key = cmd.lower()
    
    # Check naive keywords
    target = None
    if "fusion" in app_key: target = "fusion360"
    elif "idea" in app_key: target = "ideamaker"
    elif "blender" in app_key: target = "blender"
    elif "excel" in app_key: target = "excel"
    
    if target:
        path = find_executable(target)
        print(f"[Launcher] Opening {target}...")
        try:
            # Use 'start' on Windows to detach
            if platform.system() == "Windows":
                # If it's a shortcut or generic command, os.startfile is often better
                if path.endswith(".lnk") or path == "excel":
                    os.startfile(path)
                else:
                    os.system(f'start "" "{path}"')
            else:
                subprocess.Popen([path])
            return True
        except Exception as e:
            print(f"[Launcher] Error opening {target}: {e}")
            return False
    else:
        print(f"[Launcher] Unknown command: {cmd}")
        return False

def main():
    print(f"--- Englabs System Launcher ---")
    print(f"Monitoring {MES_URL} for commands...")
    
    # In a real scenario, this script would authenticate and poll the backend.
    # Since we cannot easily add a polling endpoint to the Docker backend without rebuilding,
    # we will Simulate the polling by checking a local temporary file shared with the container?
    # NO, we can poll the API. I will assume we add the endpoint.
    
    # WORKAROUND for Agents:
    # Since I cannot modify the backend and rebuild instantly reliably without user waiting, 
    # I will make this script be a "Listener" that the User runs.
    # But wait, the Frontend needs to trigger this.
    
    # SIMULATION MODE:
    # Realistically, for this demo, we can just say:
    # "Please run this script, and type the command here to test opening."
    # OR, we implement a simple socket server here?
    
    # Let's stick to the Polling Architecture.
    # I will modify the backend to verify the endpoint exists.
    pass

if __name__ == "__main__":
    # For this demo, we will just prompt the user since we can't bridge Docker->Host easily without networking setup.
    print("--- Englabs Desktop Launcher Extension ---")
    print("This agent listens for commands from the MES to open local apps.")
    print("Supports: Fusion 360, IdeaMaker, Blender, Excel")
    print("\n[NOTE] In this production environment, please ensure paths in the script match your installation.")
    
    print(f"Monitoring {MES_URL} for commands (Interval: {POLL_INTERVAL}s)...")
    
    while True:
        try:
            # Poll the API
            try:
                resp = requests.get(MES_URL, timeout=2)
                if resp.status_code == 200:
                    data = resp.json()
                    commands = data.get("commands", [])
                    for cmd_data in commands:
                        app_name = cmd_data.get("app")
                        print(f"[Remote Command] Received request for: {app_name}")
                        execute_command(app_name)
            except requests.exceptions.ConnectionError:
                # Backend might be down or restarting
                pass
            
            time.sleep(POLL_INTERVAL)
            
        except KeyboardInterrupt:
            print("Stopping Launcher...")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(POLL_INTERVAL)
