from typing import Dict, Any
import random
from .geometric_engine import GeometricEngine
from .conversion_worker import ConversionWorker
from .pricing_engine import PricingEngine
from .pricing_engine import PricingEngine
from .storage_manager import StorageManager
from .suitability_engine import SuitabilityEngine

class PartAnalysisService:
    @staticmethod
    def analyze_file(filename: str, file_obj=None) -> Dict[str, Any]:
        """
        Orchestrates the 4-Agent Pipeline:
        1. Storage (Save file)
        2. Conversion (Normalize to STL)
        3. Geometry (Analyze Physics)
        4. Pricing (Quote)
        """
        
        # 1. Agent D: Intake
        stored_path = StorageManager.save_upload(file_obj, filename)
        
        # 2. Agent B: Conversion
        print(f"[Service] Calling conversion on {stored_path}...")
        stl_path = ConversionWorker.convert_to_stl(stored_path)
        print(f"[Service] Conversion returned {stl_path}")
        
        # 3. Agent A: Geometry
        if filename.lower().endswith(('.step', '.stp', '.sldprt')):
            print(f"[Service] Using Exact CAD Analysis for {filename}")
            geo_data = GeometricEngine.analyze_step_or_sldprt(stored_path)
            geo_data["original_format"] = "CAD"
            
            # Generate Thumbnail
            thumb_path = ConversionWorker.generate_thumbnail(stored_path)
        else:
            geo_data = GeometricEngine.analyze_stl(stl_path)
            # GENERATE STL THUMBNAIL
            thumb_path = ConversionWorker.generate_thumbnail_stl(stl_path)
            
        printability = ConversionWorker.check_printability(stl_path)
        
        # 4. Agent C: Pricing
        # Defaulting to PLA/FDM for the initial instant quote
        quote = PricingEngine.calculate_quote(
            measurements=geo_data,
            material_key="PLA"
        )
        
        # Determine status
        status = "PRINTABLE" if printability["manifold"] else "NEEDS_REPAIR"
        
        # 5. Agent A (Analyst): Suitability & Economic Check
        tech_assessment = SuitabilityEngine.assess_technical(geo_data)
        econ_assessment = SuitabilityEngine.assess_economic(geo_data, "PLA")

        # Flattening response for Frontend (simpler consumption)
        return {
            "filename": filename,
            "image_url": "https://placehold.co/400x300?text=CAD+Preview", 
            "status": status,
            
            # Flatted Geometry
            "volume_cm3": geo_data["volume_cm3"],
            "bounding_box": geo_data["bounding_box"],
            "poly_count": geo_data["poly_count"],
            
            # Flatted Analysis
            "printability_score": tech_assessment["score"], # Use calculated score
            "material_suggestion": "PLA (Draft)" if "PLA" in quote else "Nylon (Durable)",
            "issues": tech_assessment["reasons"],
            
            # Suitability Data (New)
            "technical_score": tech_assessment["score"],
            "technical_badge": tech_assessment["badge"],
            "economic_data": econ_assessment,
            
            # Raw Data (optional, kept for debug)
            "raw_geometry": geo_data,
            "raw_printability": printability,
            "quote": quote,
            "storage_path": stored_path,
            "thumbnail_path": thumb_path
        }
