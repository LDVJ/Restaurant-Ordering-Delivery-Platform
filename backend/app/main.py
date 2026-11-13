from fastapi import FastAPI, Request
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
    delivery,
    ai_insight
)
from app.exception_handlers import register_exception_handlers

from contextlib import asynccontextmanager
from app.tasks.reminder_tasks import start_scheduler, end_scheduler

import logging
import time

@asynccontextmanager
async def lifespan(app : FastAPI):
    start_scheduler()
    yield
    end_scheduler()

app = FastAPI(lifespan=lifespan)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

logger = logging.getLogger("campusbite.api")

@app.middleware("http")
async def logging_request_and_timing_middleware(request : Request, call_next):
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        process_time = (time.perf_counter() - start_time) * 1000
        logger.exception(
            "%s %s - unhandled error (%.2fms)",
            request.method, request.url.path, process_time
        )
        raise
    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.2f}ms)")

    return response
 
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
app.include_router(ai_insight.router)

@app.get("/")
async def root():
    return {
        "status": "ok"
    }
