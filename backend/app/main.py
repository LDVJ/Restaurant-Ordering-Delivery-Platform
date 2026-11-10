from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth, 
    owner, 
    customer,
    address,
    customer_orders
)
from app.exception_handlers import register_exception_handlers

app = FastAPI()

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

@app.get("/")
async def root():
    return {
        "status": "ok"
    }
