from flask import Flask, jsonify, request, session
from flask_cors import CORS
from db import init_db, create_user, verify_user, public_user

app = Flask(__name__)
app.config.update(
    SECRET_KEY="locallink-demo-secret-change-this-in-production",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)

CORS(app, supports_credentials=True)

init_db()

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "application": "LocalLink"})

@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    required = ["name", "username", "password", "region", "local_area"]

    if any(not str(data.get(field, "")).strip() for field in required):
        return jsonify({"error": "All fields are required."}), 400

    if len(data["password"]) < 6:
        return jsonify({"error": "Password must contain at least 6 characters."}), 400

    user_id = create_user(
        data["name"].strip(),
        data["username"].strip().lower(),
        data["password"],
        data["region"].strip(),
        data["local_area"].strip()
    )

    if user_id is None:
        return jsonify({"error": "Username already exists."}), 409

    return jsonify({"message": "Registration successful. Please login."}), 201

@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip().lower()
    password = data.get("password", "")

    user = verify_user(username, password)
    if not user:
        return jsonify({"error": "Invalid username or password."}), 401

    session.clear()
    session["user_id"] = user["id"]
    session["username"] = user["username"]

    return jsonify({"message": "Login successful.", "user": public_user(user)})

@app.get("/api/auth/me")
def me():
    if "user_id" not in session:
        return jsonify({"authenticated": False, "user": None})

    from db import get_connection
    with get_connection() as conn:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (session["user_id"],)).fetchone()

    if not user:
        session.clear()
        return jsonify({"authenticated": False, "user": None})

    return jsonify({"authenticated": True, "user": public_user(user)})

@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out."})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
