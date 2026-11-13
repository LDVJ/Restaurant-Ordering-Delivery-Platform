from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB_URL : str
    JWT_SECRET : str
    JWT_ALGORITHM : str
    ACCESS_TOKEN_EXPIRE_MINUTES : int
    GEMINI_API_KEY : str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()