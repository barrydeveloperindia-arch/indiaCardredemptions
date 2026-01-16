from fastapi import APIRouter
from app.api.v1.endpoints import transactions, import_jobs, dashboard, budgets, analytics, integrations

api_router = APIRouter()
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(import_jobs.router, prefix="/import", tags=["import"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
