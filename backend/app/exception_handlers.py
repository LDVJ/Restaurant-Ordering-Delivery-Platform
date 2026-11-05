import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

LOCATION_PREFIXES = {"body", "query", "path", "header", "cookie"}

FRIENDLY_MESSAGES = {
    "missing": "This field is required",
    "json_invalid": "Request body is not valid JSON",
}


def _field_name(loc: tuple) -> str:
    # ("body", "email") -> "email"
    parts = [str(p) for p in loc if p not in LOCATION_PREFIXES]
    return ".".join(parts) or "request"


def _message(err: dict) -> str:
    if err["type"] in FRIENDLY_MESSAGES:
        return FRIENDLY_MESSAGES[err["type"]]
    # messages from your @field_validator / @model_validator start with this prefix
    return err["msg"].removeprefix("Value error, ")


async def request_validation_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"field": _field_name(e["loc"]), "message": _message(e)}
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation failed", "errors": errors},
    )


async def response_validation_handler(request: Request, exc: ResponseValidationError):
    logger.error("Response validation failed on %s %s: %s",
                 request.method, request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong on our side. Please try again later."},
    )


async def database_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred. Please try again later."},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, request_validation_handler)
    app.add_exception_handler(ResponseValidationError, response_validation_handler)
    app.add_exception_handler(SQLAlchemyError, database_error_handler)