import os
import sys
import requests
import time
import concurrent.futures
import argparse
from pathlib import Path
from typing import Optional, Dict

# --- Configuration ---
DEFAULT_API_URL = "http://localhost:8000/api/part-analysis/analyze"
DEFAULT_WORKERS = 3
DEFAULT_TIMEOUT = 10.0 # Seconds (Connect + Read)
EXTENSIONS = {".step", ".stp", ".sldprt", ".stl"}

class AgentStats:
    def __init__(self):
        self.success = 0
        self.failed = 0
        self.timed_out = 0
        self.skipped = 0
        self.total_processed = 0

stats = AgentStats()

def upload_file(file_path: Path, api_url: str, timeout: float) -> Dict:
    """
    Worker function to upload a single file with strict timeouts.
    """
    # 1. Prepare Metadata
    project_id = file_path.parent.name
    # Heuristic for project ID (same as original script)
    try:
        # If we can infer a root for the uploads, we could be smarter, but 
        # parent directory is robust enough for flat-ish structures.
        pass
    except:
        pass

    result_code = "UNKNOWN"
    details = ""

    try:
        with open(file_path, "rb") as f:
            # 2. Network Request with Timeout
            start_time = time.time()
            response = requests.post(
                api_url, 
                files={"file": f},
                data={"project_id": project_id, "source_path": str(file_path)},
                timeout=timeout
            )
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                result_code = "SUCCESS"
                data = response.json()
                details = f"Vol: {data.get('volume_cm3', '?')} cm3 | {elapsed:.2f}s"
            else:
                result_code = f"FAILED ({response.status_code})"
                details = response.text[:100] # Truncate error

    except requests.exceptions.Timeout:
        result_code = "TIMEOUT"
        details = f"Request exceeded {timeout}s"
    except requests.exceptions.ConnectionError:
        result_code = "CONN_ERR"
        details = "Server unreachable"
    except Exception as e:
        result_code = "ERROR"
        details = str(e)

    return {
        "file": file_path.name,
        "status": result_code,
        "details": details
    }

def run_multi_agent_upload(folder_path: str, api_url: str, workers: int, timeout: float):
    folder = Path(folder_path)
    if not folder.exists():
        print(f"Error: Folder not found: {folder_path}")
        return

    print(f"--- Multi-Agent Uploader ---")
    print(f"Target: {folder}")
    print(f"API:    {api_url}")
    print(f"Agents: {workers}")
    print(f"Timeout:{timeout}s")
    print("-" * 40)

    # 1. Scan Files
    files = [f for f in folder.glob("**/*") if f.suffix.lower() in EXTENSIONS]
    total_files = len(files)
    print(f"Found {total_files} files. Starting ingestion...")

    # 2. Parallel Execution
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        # Sort files by size? maybe smaller first? No, let's just go.
        
        future_to_file = {
            executor.submit(upload_file, f, api_url, timeout): f 
            for f in files
        }
        
        completed_count = 0
        
        for future in concurrent.futures.as_completed(future_to_file):
            file_path = future_to_file[future]
            try:
                res = future.result()
                status = res["status"]
                
                # Update Stats
                stats.total_processed += 1
                if status == "SUCCESS":
                    stats.success += 1
                    symbol = "[OK]"
                elif status == "TIMEOUT":
                    stats.timed_out += 1
                    symbol = "[TIMEOUT]"
                else:
                    stats.failed += 1
                    symbol = "[FAIL]"
                
                completed_count += 1
                print(f"[{completed_count}/{total_files}] {symbol} {res['file']} -> {res['details']}")
                
            except Exception as exc:
                print(f"[{completed_count}/{total_files}] [CRASH] {file_path.name} generated an exception: {exc}")
                stats.failed += 1

    # 3. Summary
    print("-" * 40)
    print("Optimization Complete.")
    print(f"Total:   {stats.total_processed}")
    print(f"Success: {stats.success}")
    print(f"Failed:  {stats.failed}")
    print(f"Timeout: {stats.timed_out}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-Agent Bulk Uploader")
    parser.add_argument("folder", nargs="?", help="Path to folder containing CAD files")
    parser.add_argument("--url", default="http://127.0.0.1:8008/api/part-analysis/analyze", help="API Endpoint URL")
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS, help="Number of parallel agents")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT, help="Request timeout in seconds")
    
    args = parser.parse_args()
    
    target_folder = args.folder
    
    # Interactive fallback
    if not target_folder:
        default_path = r"C:\Users\pc\Englabs India Pvt Ltd\Enquiries manager - 2025 ENQUIRIES\ENQUIRIES 2025"
        print(f"No folder argument. Default: {default_path}")
        inp = input("Press Enter to use default, or type path: ")
        target_folder = inp.strip() if inp.strip() else default_path

    run_multi_agent_upload(target_folder, args.url, args.workers, args.timeout)
