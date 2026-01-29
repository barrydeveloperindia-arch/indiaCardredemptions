import pandas as pd
try:
    xl = pd.ExcelFile("storage/enquiries_register.xlsx")
    print("Sheets found:", xl.sheet_names)
    
    # Try reading MASTER LIST
    df = xl.parse('MASTER LIST')
    print("Columns:", df.columns.tolist())
    print(df.head(5).to_string())
except Exception as e:
    print(f"Error reading excel: {e}")
