import jwt
from fastapi import Request, HTTPException, status, Depends
from app.config import settings
from app.utils.security import decode_token

def verify_jwt(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to Authorization header for API access if needed, 
        # but prefer cookies for web app
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        payload = decode_token(token, settings.JWT_SECRET)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def check_role(required_role: str):
    def role_checker(payload: dict = Depends(verify_jwt)):
        user_role = payload.get("role")
        if user_role != required_role and user_role != "Super Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have the required permissions"
            )
        return payload
    return role_checker
