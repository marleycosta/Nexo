#!/usr/bin/env python
import os
import time
from urllib.parse import urlparse


def wait_for_db():
    import psycopg2

    url = os.environ.get("DATABASE_URL", "postgres://nexo:nexo@db:5432/nexo")
    parsed = urlparse(url)
    for _ in range(30):
        try:
            conn = psycopg2.connect(
                dbname=parsed.path.lstrip("/") or "nexo",
                user=parsed.username or "nexo",
                password=parsed.password or "nexo",
                host=parsed.hostname or "db",
                port=parsed.port or 5432,
            )
            conn.close()
            return
        except Exception:
            time.sleep(1)
    raise SystemExit("Database not ready")


def main():
    print("Waiting for database...")
    wait_for_db()
    os.system("python manage.py migrate --noinput")
    os.execvp("python", ["python", "manage.py", "runserver", "0.0.0.0:8000"])


if __name__ == "__main__":
    main()
