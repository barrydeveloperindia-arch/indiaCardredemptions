import os
import shutil
from datetime import datetime

class StorageManager:
    """
    Agent D: Intake & Storage
    Manages physical file storage (simulating S3/MinIO bucket).
    """
    
    BASE_DIR = "storage/parts"

    @staticmethod
    def save_upload(file_obj, filename: str) -> str:
        # Create directory if not exists
        if not os.path.exists(StorageManager.BASE_DIR):
            os.makedirs(StorageManager.BASE_DIR, exist_ok=True)
            
        # Keep original filename for this demo to match viewer URL
        # In prod, we'd sanitize more, but we need it to match `storage/parts/{filename}`
        file_path = os.path.join(StorageManager.BASE_DIR, filename)
        
        # Write file from SpooledTemporaryFile
        with open(file_path, "wb") as buffer:
           shutil.copyfileobj(file_obj, buffer)
        
        return file_path

    @staticmethod
    def get_public_url(local_path: str) -> str:
        # Mock generating a signed URL
        filename = os.path.basename(local_path)
        return f"/api/storage/files/{filename}"

    @staticmethod
    def delete_file(file_path: str):
        """
        Deletes a file if it exists.
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"[Storage] Deleted {file_path}")
                
            # Check for associated STL (if conversion happened)
            base, ext = os.path.splitext(file_path)
            if ext.lower() != ".stl":
                stl_path = base + ".stl"
                if os.path.exists(stl_path):
                    os.remove(stl_path)
                    print(f"[Storage] Deleted associated STL {stl_path}")
        except Exception as e:
            print(f"[Storage] Error deleting {file_path}: {e}")
