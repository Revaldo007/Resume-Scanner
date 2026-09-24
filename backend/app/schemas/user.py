import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+$")


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not USERNAME_PATTERN.match(value):
            raise ValueError(
                "Username may only contain letters, numbers, dots, dashes and underscores"
            )
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        # bcrypt only uses the first 72 BYTES of a password, so reject longer
        # ones instead of silently truncating them (or erroring in hashing).
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password is too long (maximum 72 bytes)")
        return value


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
