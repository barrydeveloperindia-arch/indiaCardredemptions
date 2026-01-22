
# Fusion 360 Script - Englabs MES Connector
# Author: Antigravity AI
# Description: Exports current design as STEP and uploads to Englabs MES Local Server

import adsk.core, adsk.fusion, adsk.cam, traceback
import os
import tempfile
import json

# ==========================================
# CONFIGURATION
# ==========================================
MES_SERVER_URL = "http://localhost:8008/api/part-analysis/analyze"
# ==========================================

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface
        design = app.activeProduct
        if not design:
            ui.messageBox('No active Fusion 360 design found', 'Englabs MES Connector')
            return

        # 1. Get Export Manager
        exportMgr = design.exportManager
        
        # 2. Define Temp Path
        temp_dir = tempfile.gettempdir()
        filename = app.activeDocument.name
        # Remove version number if present (v1, v2...)
        if ' v' in filename:
            filename = filename.split(' v')[0]
            
        step_path = os.path.join(temp_dir, filename + '.step')

        # 3. Export to STEP
        stepOptions = exportMgr.createSTEPExportOptions(step_path)
        exportMgr.execute(stepOptions)
        
        # 4. Upload to MES (Using Python standard lib usually available in Fusion 360 environment)
        # Note: Fusion 360's Python is limited. We use urllib.request
        
        import urllib.request
        import mimetypes
        
        # Helper to do multipart upload with standard library
        # Simplified for brevity; usually requires thorough multipart construction
        
        # For simplicity in this demo script, we will alert user.
        # Real implementation requires 'requests' module which isn't default in Fusion 360, 
        # or manual multipart construction.
        
        # Let's try attempting a "manual" multipart construction
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        data = []
        
        data.append(f'--{boundary}')
        data.append(f'Content-Disposition: form-data; name="file"; filename="{filename}.step"')
        data.append('Content-Type: application/step')
        data.append('')
        
        with open(step_path, 'rb') as f:
            file_bytes = f.read()
            
        # We need to send bytes, so let's construct body as bytes
        body = b'\r\n'.join([x.encode('utf-8') for x in data])
        body += b'\r\n' + file_bytes + b'\r\n'
        body += f'--{boundary}--'.encode('utf-8')
        
        req = urllib.request.Request(MES_SERVER_URL, data=body)
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
        
        try:
            with urllib.request.urlopen(req) as response:
                result = response.read().decode('utf-8')
                ui.messageBox(f'Successfully uploaded to MES!\n\nResponse: {result}', 'Englabs MES Connector')
        except Exception as e:
            ui.messageBox(f'Failed to upload to MES.\n\nError: {str(e)}\n\nCheck if Server is running at {MES_SERVER_URL}', 'Connection Error')

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
