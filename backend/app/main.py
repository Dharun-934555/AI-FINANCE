from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.api import auth, dashboard, transactions, budget, savings, subscriptions, simulations, intelligence

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Finora (RupeeWise AI) - Intelligent Gen Z Personal Finance & Simulation Platform"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(budget.router, prefix=settings.API_V1_STR)
app.include_router(savings.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(simulations.router, prefix=settings.API_V1_STR)
app.include_router(intelligence.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "Finora - RupeeWise AI",
        "tagline": "Your money. Your decisions. Your future.",
        "status": "operational",
        "docs": "/docs"
    }
