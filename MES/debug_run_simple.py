
import os
import subprocess

loader_code = "exec(open('/app/simple_test.py').read())"
cmd = ["freecadcmd", "-c", loader_code]

print(f"DEBUG: Running simple test command: {cmd}")

try:
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True
    )
    print("DEBUG: STDOUT:")
    print(result.stdout)
    print("DEBUG: STDERR:")
    print(result.stderr)
    
except subprocess.CalledProcessError as e:
    print(f"DEBUG: Command FAILED (Exit Code {e.returncode}).")
    print("DEBUG: STDOUT:")
    print(e.stdout)
    print("DEBUG: STDERR:")
    print(e.stderr)
