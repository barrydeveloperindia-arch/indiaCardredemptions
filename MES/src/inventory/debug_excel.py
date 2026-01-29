import pandas as pd

def check_excel():
    try:
        xl = pd.ExcelFile("storage/enquiries_register.xlsx")
        df = xl.parse('MASTER LIST')
        df.columns = [str(c).strip() for c in df.columns]
        
        print("Columns:", df.columns.tolist())
        
        # Check rows where EQ is present but FROM is nan
        unknowns = df[df['FROM'].isna() & df['EQ NO'].notna()]
        print(f"\nValid EQs with Empty 'FROM': {len(unknowns)}")
        
        if len(unknowns) > 0:
            print("\nSample Rows:")
            print(unknowns[['EQ NO', 'DESCRIPTION', 'FROM', 'HANDLED BY']].head(10))
            
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_excel()
