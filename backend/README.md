Alembic migration commands:

- uv run alembic upgrade head
- uv run alembic downgrade -1
- uv run alembic current

Fresh database bootstrap:

- uv run python app/init_db.py

Notes:

- app/init_db.py creates tables from the current SQLAlchemy models, seeds initial data, and stamps the database to the current Alembic head.
- Existing databases should be migrated with Alembic rather than the legacy one-off migration scripts.
