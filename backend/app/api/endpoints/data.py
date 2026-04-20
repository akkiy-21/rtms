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
    date_str: str = Query(..., alias="date"),
    encoding: str = Query('UTF-8'),  # encoding クエリパラメータを追加
    db: Session = Depends(get_db)
):
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    csv_data = data_service.get_aggregated_data(db, device_id, target_date)
    if not csv_data:
        raise HTTPException(status_code=404, detail="No data found for the specified device and date.")

    # デバイス名を取得
    device = device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")

    # デバイス名からファイル名に使用できない文字を削除
    sanitized_device_name = re.sub(r'[\\/*?:"<>|]', "_", device.name)

    # ファイル名を生成
    filename = f"{sanitized_device_name}_{device_id}_{target_date.strftime('%Y%m%d')}.csv"

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
    writer.writerow(['time_shift', 'good_qty', 'ng_qty'])
    for row in csv_data:
        writer.writerow(row)

    output.seek(0)
    headers = {
        # ASCIIのみのファイル名を指定
        "Content-Disposition": f"attachment; filename=\"{ascii_filename}\"; filename*={encoding}''{encoded_filename}"
    }
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers=headers
    )