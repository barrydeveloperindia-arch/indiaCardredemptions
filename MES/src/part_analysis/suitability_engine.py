from typing import Dict, Any
import random

class SuitabilityEngine:
    """
    Analyst Agent Logic:
    Determines if a part is suitable for Additive Manufacturing (AM)
    based on Technical Feasibility and Economic Viability.
    """

    @staticmethod
    def assess_technical(geometry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes geometric properties to determine printability score.
        Real implementation would analyze wall thickness, overhangs, etc.
        """
        volume = geometry.get("volume_cm3", 0)
        poly_count = geometry.get("poly_count", 0)
        
        # Heuristic 1: Complexity (Poly count / Volume ratio)
        # Higher complexity favors AM.
        complexity_ratio = poly_count / (volume + 1)
        
        score = 0
        reasons = []

        if volume > 5000:
            score = 40
            reasons.append("Part likely too large for standard build volume.")
        elif complexity_ratio > 100:
            score = 95
            reasons.append("High geometric complexity detected - Ideal for AM.")
        elif complexity_ratio < 10:
            score = 60
            reasons.append("Simple geometry - Likely cheaper to machine/mold.")
        else:
            score = 85
            reasons.append("Standard AM geometry.")

        return {
            "score": score,
            "reasons": reasons,
            "badge": "AM Ready" if score > 80 else "Review Needed"
        }

    @staticmethod
    def assess_economic(geometry: Dict[str, Any], material: str) -> Dict[str, Any]:
        """
        Compares AM cost vs Tradition (Injection Molding).
        """
        volume = geometry.get("volume_cm3", 0)
        
        # Cost Estimations
        am_cost = volume * 0.15  # $0.15 per cm3 roughly for AM + overhead
        mold_tooling_cost = 5000 # Fixed tooling cost
        mold_part_cost = volume * 0.02 # Cheaper per part
        
        # Break-even point
        # am_cost * Q = mold_tooling_cost + mold_part_cost * Q
        # Q * (am_cost - mold_part_cost) = mold_tooling_cost
        # Q = mold_tooling_cost / (am_cost - mold_part_cost)
        
        break_even_qty = 0
        if (am_cost - mold_part_cost) > 0:
            break_even_qty = int(mold_tooling_cost / (am_cost - mold_part_cost))
        
        action = "Print"
        if break_even_qty < 10:
             action = "Switch to Molding"
        
        return {
            "am_cost_est": round(am_cost, 2),
            "molding_cost_est": round(mold_part_cost, 2),
            "tooling_cost": mold_tooling_cost,
            "break_even_quantity": break_even_qty,
            "recommendation": "Use AM for < {} units".format(break_even_qty),
            "action": action # Print, Mold
        }
