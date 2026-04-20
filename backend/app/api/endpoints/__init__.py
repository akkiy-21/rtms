# app/api/endpoints/__init__.py

# 直接routerをインポートする形に修正
from .devices import router as devices_router
from .classifications import router as classifications_router
from .plcs import router as plcs_router
from .time_tables import router as time_tables_router
from .customers import router as customers_router
from .products import router as products_router
from .users import router as users_router
from .groups import router as groups_router
from .scan import router as scan_router
from .data import router as data_router
from .dashboard import router as dashboard_router

# エクスポートする名前を変更
__all__ = [
    "devices_router",
    "classifications_router",
    "plcs_router",
    "time_tables_router",
    "customers_router",
    "products_router",
    "users_router",
    "groups_router",
    "scan_router",
    "data_router",
    "dashboard_router",
]