from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
import asyncio

hashing = PasswordHash((BcryptHasher(),))

async def create_hash_password(password : str) -> str:
    return await asyncio.to_thread(hashing.hash, password)


async def verify_hash_password(original : str, hashed_password : str) -> bool:
    return await asyncio.to_thread(hashing.verify, original, hashed_password)


