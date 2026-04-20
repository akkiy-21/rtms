# app/api/endpoints/scan.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...database import get_db
from ...schemas import ScanRequest, ScanResponse
from ...services import scan_service

router = APIRouter(
    prefix="/scan",
    tags=["scan"]
)

@router.post("", response_model=ScanResponse)
def process_scan(scan_request: ScanRequest, db: Session = Depends(get_db)):
    result = scan_service.process_scan(db, scan_request.device_id, scan_request.scan_data)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result