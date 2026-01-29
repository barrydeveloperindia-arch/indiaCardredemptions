import pandas as pd
from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Project, Contact, generate_uuid
import math
from datetime import datetime

def import_enquiries():
    db = SessionLocal()
    try:
        xl = pd.ExcelFile("storage/enquiries_register.xlsx")
        df = xl.parse('MASTER LIST')
        
        # Normalize column names (strip spaces)
        df.columns = [str(c).strip() for c in df.columns]
        
        # Deduplicate
        original_len = len(df)
        df.drop_duplicates(subset=['EQ NO'], inplace=True)
        print(f"Deduplicated {original_len - len(df)} rows.")
        
        count = 0
        new_contacts = 0
        
        print(f"Total rows to process: {len(df)}")
        
        for index, row in df.iterrows():
            eq_no = str(row.get('EQ NO', '')).strip()
            
            # Skip invalid IDs
            if not eq_no or eq_no.lower() == 'nan':
                continue
                
            # 1. Clean Data
            customer_name_raw = row.get('FROM')
            desc_raw = row.get('DESCRIPTION')
            
            if pd.isna(customer_name_raw):
                # Fallback to Description if From is empty
                if not pd.isna(desc_raw):
                    customer_name = str(desc_raw).strip()
                else:
                    customer_name = "Unknown"
            else:
                customer_name = str(customer_name_raw).strip()
            
            if pd.isna(desc_raw):
                description = ""
            else:
                description = str(desc_raw).strip()

            if pd.isna(row.get('STATUS')):
                status = "OPEN"
            else:
                status = str(row.get('STATUS')).strip()
                
            # Value Parsing
            val_raw = row.get('VALUE', 0)
            try:
                quote_value = float(val_raw) if not pd.isna(val_raw) else 0.0
            except:
                quote_value = 0.0

            # 2. Ensure Contact Exists
            contact = db.query(Contact).filter(Contact.name == customer_name).first()
            if not contact:
                contact = Contact(
                    name=customer_name,
                    contact_type="CUSTOMER"
                )
                db.add(contact)
                db.flush() # Get ID
                new_contacts += 1
                
            # Date Parsing
            date_raw = row.get('DATE')
            try:
                start_date = pd.to_datetime(date_raw) if not pd.isna(date_raw) else datetime.now()
            except:
                start_date = datetime.now()

            # 3. Smart Upsert
            existing_proj = db.query(Project).filter(Project.project_id == eq_no).first()

            if existing_proj:
                # Update fields but PRESERVE PO data if present
                existing_proj.name = f"{description} ({customer_name})"
                existing_proj.description = description
                existing_proj.customer_id = contact.contact_id
                existing_proj.status = "ACTIVE" if status == "OPEN" else "COMPLETED"
                existing_proj.start_date = start_date
                
                # Only update quote_value if valid (don't overwrite with 0 if db has value?)
                # Actually Excel Quote Value is usually authoritative for Quote.
                if quote_value > 0:
                    existing_proj.quote_value = quote_value
                    
                # PO Number/Value are NOT touched here (Metadata Safe)
                
            else:
                # Create New
                project = Project(
                    project_id=eq_no,
                    name=f"{description} ({customer_name})",
                    description=description,
                    customer_id=contact.contact_id,
                    status="ACTIVE" if status == "OPEN" else "COMPLETED",
                    start_date=start_date,
                    quote_value=quote_value
                )
                db.add(project)
            
            # db.merge(project) <- Removed unsafe merge
            count += 1
        
        db.commit()
        print(f"Import Complete.")
        print(f"Projects Imported: {count}")
        print(f"New Customers Created: {new_contacts}")
        
    except Exception as e:
        print(f"Import Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_enquiries()
