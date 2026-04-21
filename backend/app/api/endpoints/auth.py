from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...auth import TOKEN_TYPE, create_access_token, get_current_user
from ...database import get_db
from ...schemas import ChangePasswordRequest, LoginRequest, LoginResponse, User
from ...services import user_service


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    db_user = user_service.authenticate_user(db, payload.user_id, payload.password)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID or password",
        )

    return LoginResponse(
        access_token=create_access_token(db_user),
        token_type=TOKEN_TYPE,
        user=user_service.serialize_user(db_user),
    )


@router.get("/me", response_model=User)
def read_me(current_user = Depends(get_current_user)):
    return user_service.serialize_user(current_user)


@router.post("/change-password", response_model=User)
def change_password(
    payload: ChangePasswordRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        updated_user = user_service.change_password(db, current_user, payload.current_password, payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return user_service.serialize_user(updated_user)