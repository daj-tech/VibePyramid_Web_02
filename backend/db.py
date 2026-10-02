from pathlib import Path
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "locallink.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                region TEXT NOT NULL DEFAULT 'Thane',
                local_area TEXT NOT NULL DEFAULT 'Thane West',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def create_user(name, username, password, region, local_area):
    password_hash = generate_password_hash(password)
    try:
        with get_connection() as conn:
            cursor = conn.execute("""
                INSERT INTO users (name, username, password_hash, region, local_area)
                VALUES (?, ?, ?, ?, ?)
            """, (name, username, password_hash, region, local_area))
            conn.commit()
            return cursor.lastrowid
    except sqlite3.IntegrityError:
        return None

def get_user_by_username(username):
    with get_connection() as conn:
        return conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()

def verify_user(username, password):
    user = get_user_by_username(username)
    if user and check_password_hash(user["password_hash"], password):
        return user
    return None

def public_user(user):
    if not user:
        return None
    return {
        "id": user["id"],
        "name": user["name"],
        "username": user["username"],
        "region": user["region"],
        "local_area": user["local_area"]
    }
