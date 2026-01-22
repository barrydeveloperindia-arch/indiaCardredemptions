import requests
import os
import sys

BASE_URL = "http://localhost:8008/api/part-analysis"

def create_simple_step_file(filename="test_box.step"):
    """Create a minimal valid STEP file representing a simple box."""
    step_content = """ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Simple Box'),'2;1');
FILE_NAME('test_box.step','2026-01-20T16:00:00',('Author'),('Organization'),'','','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;
#1=CARTESIAN_POINT('',(0.,0.,0.));
#2=DIRECTION('',(0.,0.,1.));
#3=DIRECTION('',(1.,0.,0.));
#4=AXIS2_PLACEMENT_3D('',#1,#2,#3);
#5=MANIFOLD_SOLID_BREP('Box',#6);
#6=CLOSED_SHELL('',(#7));
#7=ADVANCED_FACE('',(#8),#9,.T.);
#8=FACE_OUTER_BOUND('',#10,.T.);
#9=PLANE('',#4);
#10=EDGE_LOOP('',(#11,#12,#13,#14));
#11=ORIENTED_EDGE('',*,*,#15,.T.);
#12=ORIENTED_EDGE('',*,*,#16,.T.);
#13=ORIENTED_EDGE('',*,*,#17,.T.);
#14=ORIENTED_EDGE('',*,*,#18,.T.);
#15=EDGE_CURVE('',#19,#20,#21,.T.);
#16=EDGE_CURVE('',#20,#22,#23,.T.);
#17=EDGE_CURVE('',#22,#24,#25,.T.);
#18=EDGE_CURVE('',#24,#19,#26,.T.);
#19=VERTEX_POINT('',#27);
#20=VERTEX_POINT('',#28);
#21=LINE('',#27,#29);
#22=VERTEX_POINT('',#30);
#23=LINE('',#28,#31);
#24=VERTEX_POINT('',#32);
#25=LINE('',#30,#33);
#26=LINE('',#32,#34);
#27=CARTESIAN_POINT('',(0.,0.,0.));
#28=CARTESIAN_POINT('',(10.,0.,0.));
#29=VECTOR('',#3,1.);
#30=CARTESIAN_POINT('',(10.,10.,0.));
#31=VECTOR('',#35,1.);
#32=CARTESIAN_POINT('',(0.,10.,0.));
#33=VECTOR('',#36,1.);
#34=VECTOR('',#37,1.);
#35=DIRECTION('',(0.,1.,0.));
#36=DIRECTION('',(-1.,0.,0.));
#37=DIRECTION('',(0.,-1.,0.));
ENDSEC;
END-ISO-10303-21;
"""
    with open(filename, "w") as f:
        f.write(step_content)
    return filename

def test_real_conversion():
    filename = "test_box.step"
    create_simple_step_file(filename)
    
    try:
        print(f"Uploading {filename}...")
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "application/step")}
            response = requests.post(f"{BASE_URL}/analyze", files=files)
        
        if response.status_code != 200:
            print(f"Failed to upload: {response.text}")
            sys.exit(1)
        
        print("Upload successful!")
        result = response.json()
        print(f"Analysis result: {result.get('filename')}")
        
        # Check if STL was created
        stl_path = f"storage/parts/test_box.stl"
        if os.path.exists(stl_path):
            file_size = os.path.getsize(stl_path)
            print(f"✓ STL file created: {stl_path} ({file_size} bytes)")
            
            # Read first few lines to verify it's not just the placeholder
            with open(stl_path, "r") as f:
                content = f.read(200)
                if "cube" in content.lower() and file_size < 2000:
                    print("⚠ Warning: This appears to be the placeholder cube (conversion may have failed)")
                else:
                    print("✓ STL appears to contain real geometry!")
        else:
            print("✗ STL file not found")
            sys.exit(1)
        
        # Clean up
        parts = requests.get(f"{BASE_URL}/parts").json()
        target = next((p for p in parts if p["name"] == filename), None)
        if target:
            requests.delete(f"{BASE_URL}/parts/{target['part_id']}")
            print("Cleaned up test part from database")
            
    finally:
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_real_conversion()
