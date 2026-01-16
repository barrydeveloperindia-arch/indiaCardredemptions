-- Englabs Digital Thread Database Schema

-- 1. MACHINES (The Hardware Agents)
CREATE TABLE machines (
    machine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capabilities JSONB NOT NULL, -- e.g., {"axis": 5, "max_dims": [500, 500, 500], "materials": ["PLA", "Ti-6Al-4V"]}
    current_status VARCHAR(50) DEFAULT 'IDLE', -- IDLE, RUNNING, MAINTENANCE, ERROR
    telemetry_topic VARCHAR(255), -- MQTT/OPC-UA topic mapping
    location_coords JSONB, -- {"x": 10, "y": 20} for map view
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ORDERS (The Demand Signal)
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(255) NOT NULL,
    priority_level INTEGER DEFAULT 1, -- 1-10
    cad_file_path VARCHAR(1024) NOT NULL, -- Path to stored STL/STEP file
    technical_requirements JSONB NOT NULL, -- {"material": "Inconel", "tolerance": "0.01mm"}
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PLANNED, IN_PROGRESS, QC, COMPLETE, SHIPPED
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery TIMESTAMP WITH TIME ZONE
);

-- 3. DISPATCH_QUEUE (The Schedule / Digital Thread Link)
CREATE TABLE dispatch_queue (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    machine_id UUID REFERENCES machines(machine_id),
    
    -- Planning Data
    planned_start_time TIMESTAMP WITH TIME ZONE,
    estimated_runtime_seconds INTEGER,
    gcode_path VARCHAR(1024), -- Path to generated instruction set
    nesting_coordinates JSONB, -- {"x_offset": 100, "y_offset": 50, "rotation": 90}
    
    -- Execution Data
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, MACHINING, FINISHING, PAUSED, COMPLETED
    
    -- Quality / Memory Feedback
    interference_detected BOOLEAN DEFAULT FALSE,
    successful_run BOOLEAN DEFAULT TRUE, -- Used for AI Memory reinforcement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INVOICES (The Financial Record)
CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES dispatch_queue(job_id),
    order_id UUID REFERENCES orders(order_id),
    
    -- Costing Components
    machine_runtime_cost DECIMAL(10, 2) NOT NULL,
    material_cost DECIMAL(10, 2) NOT NULL,
    labor_cost DECIMAL(10, 2) DEFAULT 0.00,
    surcharges DECIMAL(10, 2) DEFAULT 0.00,
    
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_to_erp BOOLEAN DEFAULT FALSE,
    erp_reference_id VARCHAR(255) -- ID returned from QuickBooks/Xero
);

-- Indexes for performance
CREATE INDEX idx_dispatch_status ON dispatch_queue(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- 5. ACCOUNTS (Chart of Accounts)
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., '1010', '4000'
    name VARCHAR(255) NOT NULL, -- 'Cash', 'Sales Revenue'
    type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. JOURNAL_ENTRIES (General Ledger High Level)
CREATE TABLE journal_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255),
    reference_type VARCHAR(50), -- e.g., 'INVOICE', 'PAYMENT'
    reference_id UUID,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_by VARCHAR(255) DEFAULT 'SYSTEM'
);

-- 7. JOURNAL_LINES (General Ledger Detail - Debits/Credits)
CREATE TABLE journal_lines (
    line_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES journal_entries(entry_id),
    account_id UUID REFERENCES accounts(account_id),
    debit DECIMAL(15, 2) DEFAULT 0.00,
    credit DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 8. USERS (Authentication)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. INVENTORY_ITEMS (Raw Materials)
CREATE TABLE inventory_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    material_type VARCHAR(50), -- PLA, STEEL, COOLANT
    quantity_on_hand DECIMAL(15, 2) DEFAULT 0.0,
    unit_cost DECIMAL(15, 2) DEFAULT 0.0,
    unit VARCHAR(20) -- kg, L, pcs
);

-- 10. MATERIAL_TRANSACTIONS (Inventory History)
CREATE TABLE material_transactions (
    transaction_id SERIAL PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(item_id),
    job_id UUID REFERENCES dispatch_queue(job_id),
    quantity_change DECIMAL(15, 2), -- Negative for usage
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
