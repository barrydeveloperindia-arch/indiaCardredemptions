from src.database.connection import engine, Base
from src.database import models

# Import all models to ensure they are registered with Base
from src.database.models import Part, Machine, Order, DispatchQueue, Invoice, User, InventoryItem, MaterialTransaction, Account, JournalEntry, JournalLine

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully.")
