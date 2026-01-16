from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from src.database import models
import uuid

class DispatchAgent:
    def __init__(self):
        # self.llm = LocalLLMClient()
        # self.memory_db = VectorStoreClient()
        # self.interference_engine = GeometricKernel()
        pass

    def dispatch_order(self, new_order: Dict[str, Any], db: Session) -> Tuple[str, str]:
        """
        Deterministic capability-aware dispatching algorithm.
        1. Filter machines by Material/Process support.
        2. Score remaining machines by Queue Depth (Load Balancing).
        """
        reqs = new_order.get("technical_requirements", {})
        material = reqs.get("material", "UNKNOWN")
        
        print(f"[Dispatch] Analyzing machines for {material} part...")
        
        # 1. Fetch All Machines
        machines = db.query(models.Machine).all()
        candidates = []
        
        # 2. Filter by Capability
        for m in machines:
            caps = m.capabilities or {}
            supported_mats = caps.get("materials", [])
            
            # If capabilities are empty or contain "Universal", allow it. Otherwise strict check.
            if not supported_mats or "Universal" in supported_mats or material in supported_mats:
                candidates.append(m)
        
        if not candidates:
            print(f"[Dispatch] No machine found for material: {material}")
            return "FAILED_NO_CAPABILITY", None
            
        # 3. Score Candidates (Lower Score = Better)
        # Score = (Current Queue Length * 10)
        best_machine = None
        min_score = 9999
        
        for m in candidates:
            # Count queued jobs (simulated for now, real DB query ideal)
            queue_depth = len([j for j in m.jobs if j.status in ['QUEUED', 'RUNNING']])
            score = queue_depth * 10
            
            if m.current_status == 'IDLE':
                score -= 5 # Bonus for being free right now
                
            print(f"  > Candidate {m.machine_id} ({m.name}): Queue={queue_depth}, Score={score}")
            
            if score < min_score:
                min_score = score
                best_machine = m
                
        # 4. Assign
        if best_machine:
            job_id = str(uuid.uuid4())
            print(f"[Dispatch] Selected {best_machine.machine_id} (Score {min_score})")
            return job_id, best_machine.machine_id
            
        return "FAILED_UNKNOWN", None

    def extract_features(self, cad_path: str, specs: Dict[str, Any]) -> str:
        """Simple functional feature extractor."""
        material = specs.get("material", "Unknown")
        # In reality, this would read geometric properties from the component
        return f"Material:{material} Source:{cad_path}"

    def build_prompt(self, role: str, context: str, task: str) -> str:
        return f"Role: {role}\nContext: {context}\nTask: {task}"

    def handle_conflict(self, order, failed_plan, collision_data):
        """Re-prompts LLM with specific collision error data."""
        # For prototype, just return Error
        return "DISPATCH_FAILED_COLLISION"
