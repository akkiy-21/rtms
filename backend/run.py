import os

import uvicorn
from app.main import app

if __name__ == "__main__":
    host = os.getenv("UVICORN_HOST", "0.0.0.0")
    port = int(os.getenv("UVICORN_PORT", "8000"))
    default_workers = "1" if os.name == "nt" else "4"
    workers = int(os.getenv("UVICORN_WORKERS", default_workers))

    uvicorn.run("run:app", host=host, port=port, workers=workers)
