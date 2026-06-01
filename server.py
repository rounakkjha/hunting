"""
HuntLog backend — persists all user data to SQLite.
Run: python3 server.py
"""

import json
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

DB_PATH = 'huntlog.db'

app = Flask(__name__)
CORS(app)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user_data (
            user_id   TEXT PRIMARY KEY,
            data      TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


@app.route('/api/data/<user_id>', methods=['GET'])
def get_data(user_id):
    conn = get_db()
    row = conn.execute(
        'SELECT data FROM user_data WHERE user_id = ?', (user_id,)
    ).fetchone()
    conn.close()
    if row:
        return jsonify(json.loads(row['data']))
    return jsonify(None)


@app.route('/api/data/<user_id>', methods=['PUT'])
def save_data(user_id):
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({'error': 'Invalid JSON'}), 400
    conn = get_db()
    conn.execute('''
        INSERT INTO user_data (user_id, data, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    ''', (user_id, json.dumps(payload)))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    init_db()
    print('HuntLog backend running on http://localhost:3001')
    app.run(port=3001, debug=False)
