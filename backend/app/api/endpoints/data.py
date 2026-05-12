# app/api/endpoints/data.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ...database import get_db
from ...services import data_service, device_service
from fastapi.responses import StreamingResponse
from datetime import datetime
import csv
import io
import re
from urllib.parse import quote

router = APIRouter(
    prefix="/data",
    tags=["data"]
)

# 集計データのダウンロードエンドポイント
@router.get("/{device_id}/aggregated_data")
def get_aggregated_data(
    device_id: int,
    start_date_str: str = Query(..., alias="start_date"),
    end_date_str: str = Query(..., alias="end_date"),
    encoding: str = Query('UTF-8'),
    db: Session = Depends(get_db)
):
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date.")

    csv_data = data_service.get_aggregated_data(db, device_id, start_date, end_date)
    if not csv_data:
        raise HTTPException(status_code=404, detail="No data found for the specified device and date range.")

    # デバイス名を取得
    device = device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")

    # デバイス名からファイル名に使用できない文字を削除
    sanitized_device_name = re.sub(r'[\\/*?:"<>|]', "_", device.name)

    # ファイル名を生成
    filename = f"{sanitized_device_name}_{device_id}_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.csv"

    # ASCII部分のファイル名を作成（非ASCII文字を除去）
    ascii_filename = re.sub(r'[^\x00-\x7F]', '_', filename)

    # 指定されたエンコーディングでファイル名をエンコード
    try:
        encoded_filename = quote(filename.encode(encoding))
    except LookupError:
        raise HTTPException(status_code=400, detail=f"Unsupported encoding: {encoding}")

    # CSVをメモリ上に作成
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['date', 'time_shift', 'good_qty', 'ng_qty'])
    for row in csv_data:
        writer.writerow(row)

    output.seek(0)
    headers = {
        "Content-Disposition": f"attachment; filename=\"{ascii_filename}\"; filename*={encoding}''{encoded_filename}"
    }
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers=headers
    )