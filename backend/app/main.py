from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth, 
    owner, 
    customer,
    address,
    customer_orders,
    owner_order,
    owner_reminder,
    owner_order_returns,
    delivery
)
from app.exception_handlers import register_exception_handlers

from contextlib import asynccontextmanager
from app.tasks.reminder_tasks import start_scheduler, end_scheduler

@asynccontextmanager
async def lifespan(app : FastAPI):
    # start_scheduler()
    yield
    end_scheduler()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
       "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

register_exception_handlers(app=app)


app.include_router(auth.router)
app.include_router(owner.router)
app.include_router(customer.router)
app.include_router(address.router)
app.include_router(customer_orders.router)
app.include_router(owner_order.router)
app.include_router(owner_reminder.router)
app.include_router(owner_order_returns.router)
app.include_router(delivery.router)

@app.get("/")
async def root():
    return {
        "status": "ok"
    }
