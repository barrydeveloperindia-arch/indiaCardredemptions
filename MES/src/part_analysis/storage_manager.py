import os
import shutil
from datetime import datetime

class StorageManager:
    """
    Agent D: Intake & Storage
    Manages physical file storage (simulating S3/MinIO bucket).
    """
    
    BASE_DIR = "c:\\Users\\abrbh\\Documents\\Antigravity\\MES\\storage\\uploads"

    @staticmethod
    def save_upload(file_obj, filename: str) -> str:
        # Create directory if not exists
        if not os.path.exists(StorageManager.BASE_DIR):
            os.makedirs(StorageManager.BASE_DIR, exist_ok=True)
            
        # Timestamp the filename to avoid collisions
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = f"{timestamp}_{filename}"
        file_path = os.path.join(StorageManager.BASE_DIR, safe_name)
        
        # Mock writing file (since UploadFile is an async stream we can't easily read in this sync mock without await)
        # In real implementation: 
        # with open(file_path, "wb") as buffer:
        #    shutil.copyfileobj(file_obj.file, buffer)
        
        # For this demo, just return the path where it WOULD be
        return file_path

    @staticmethod
    def get_public_url(local_path: str) -> str:
        # Mock generating a signed URL
        filename = os.path.basename(local_path)
        return f"/api/storage/files/{filename}"
