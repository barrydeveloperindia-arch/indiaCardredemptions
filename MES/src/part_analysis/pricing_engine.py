class PricingEngine:
    """
    Agent C: Dynamic Pricing
    Calculates quotes based on Geometry (Volume) + Market Rates (Material).
    """
    
    # Mock Material DB
    MATERIALS_DB = {
        "PLA": {"cost_per_cm3": 0.05, "density": 1.24},
        "PETG": {"cost_per_cm3": 0.07, "density": 1.27},
        "ASA": {"cost_per_cm3": 0.08, "density": 1.07},
        "NYLON-CF": {"cost_per_cm3": 0.15, "density": 1.15},
        "RESIN_STD": {"cost_per_cm3": 0.12, "density": 1.10}
    }
    
    MACHINE_RATES = {
        "FDM_STANDARD": 5.00, # $5/hr
        "FDM_INDUSTRIAL": 15.00,
        "SLA_STANDARD": 10.00
    }

    @staticmethod
    def calculate_quote(measurements: dict, material_key: str, machine_type: str = "FDM_STANDARD"):
        volume_cm3 = measurements.get("volume_cm3", 0.0) or 0.0
        
        material_info = PricingEngine.MATERIALS_DB.get(material_key, PricingEngine.MATERIALS_DB["PLA"])
        
        # 1. Material Cost
        material_cost = volume_cm3 * material_info["cost_per_cm3"]
        
        # 2. Runtime Estimation (Heuristic: 10 cm3 per hour on standard FDM)
        estimated_hours = max(0.5, volume_cm3 / 20.0) 
        machine_cost = estimated_hours * PricingEngine.MACHINE_RATES.get(machine_type, 5.00)
        
        # 3. Post-Processing & Markup
        post_process_fee = 2.00
        markup = 1.3 # 30% margin
        
        total_price = (material_cost + machine_cost + post_process_fee) * markup
        
        return {
            "currency": "USD",
            "total_price": round(total_price, 2),
            "breakdown": {
                "material_cost": round(material_cost, 2),
                "machine_cost": round(machine_cost, 2),
                "post_processing": post_process_fee,
                "estimated_runtime_hours": round(estimated_hours, 1)
            }
        }
